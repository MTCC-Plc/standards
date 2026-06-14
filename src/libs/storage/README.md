## Storage

Storage service integration.

### Usage

First step is to create an app in the storage service. This will give the `appKey` which is required for the integration. Other settings such as max file size can also be configured while creating.

Register the StorageModule in the AppModule and pass in the configurations.

```ts
// app.module.ts
import { StorageModule } from 'standards';
@Module({
  imports: [
    StorageModule.forRoot({
      host: process.env.STORAGE_HOST,
      appKey: process.env.STORAGE_KEY,
    }),
  ]})
// or if using configService/settingService or something similar
@Module({
  imports: [
    StorageModule.forRootAsync({
      imports: [SettingModule],
      inject: [SettingService],
      useFactory: async (settingService: SettingService) => {
        const [host, appKey] = await settingService.findMany([
          'storageUrl',
          'storageKey',
        ]);
        return {
          host,
          appKey,
        };
      },
    }),
  ]})

```

- `host` URL of the storage service.
- `appKey` App key for the app on the storage service.

Use `StorageService` in relevant services/controllers/resolvers.

#### Upload a file

Example of how uploads should be done with the upload service in a controller. First, the initial checks are done. These checks may include user permission checks, file type/extensions check and other required checks. Then the file is uploaded to the service using the `upload` function. The remaining operations need to be done inside a `try` block so that if there is an error there (e.g. database insert error), the uploaded file can be deleted. This is to prevent orphaned files.

File metadata such as file size, name and mime type are maintained by the storage service so it does not need to be stored in the application's db.

```ts
// attachment.controller.ts
import { StorageService } from "standards";
@Controller("attachment")
export class AttachmentController {
  constructor(private storageService: StorageService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateAttachmentInput
  ) {
    // check user access, file type checks, etc
    const object = await this.storageService.upload(file);
    try {
      // db stuff, notifications, etc
      // store objectId in the app's db here
    } catch (e) {
      await this.storageService.delete(object.id);
      throw e;
    }
  }
}
```

OCR can also be run during upload by passing options. This runs in parallel with the upload so it does not add much latency. The result is returned on the `ocrResult` field of the uploaded object.

```ts
// plain text OCR
const object = await this.storageService.upload(file, { ocr: true });
const text = object.ocrResult as string;

// structured field extraction — keys are field names, values are descriptions
const object = await this.storageService.upload(file, {
  ocrFields: {
    name: "Full name of the card holder",
    idCardNo: "The ID card number",
  },
});
const fields = object.ocrResult as Record<string, string>;
```

#### Serve a file

Example of how files should be served with the upload service. The serve method will fetch the file and also set the relevant headers.

- Content-Length: For indicating file size and checking download progress
- Content-Disposition: To provide the file name when downloading
- Content-Type: For viewing within the browser
- Cache-Control: For caching in the browser. Set to 1 week.

The `serve` method should be called at the end of the controller as it will terminate the http request.

```ts
// attachment.controller.ts
import { StorageService } from "standards";
@Controller("attachment")
export class AttachmentController {
  constructor(private storageService: StorageService) {}

  @Get(":id")
  async viewAttachment(@Req() req, @Param() params, @Res() res) {
    // check user access, other checks, etc
    // the id passed into the serve function is the same
    // objectId returned during the upload above
    await this.storageService.serve(params.id, res);
  }
}
```

Images are converted to WebP on the fly when served. The following options can be passed to `serve` (and `fetch`):

- `original: true` serves the original stored object without WebP conversion.
- `lossy: true` forces lossy WebP for PNGs, which are otherwise lossless by default.
- `quality` sets WebP quality for lossy responses. Default is 80.
- `width` and `height` resize the image. Images can only be scaled down, not up. If only one is provided, the other is auto-scaled to preserve the aspect ratio.

```ts
// serve a 200px wide thumbnail
await this.storageService.serve(params.id, res, { width: 200 });
```

#### Run OCR on a file

Example of how OCR can be run on a file. Only applicable to images and PDFs. Throws an error if the object is not a supported type. The result is cached on the object, so repeat calls return the stored text. Cleaning and parsing must be done on the resulting text to extract the required data.

```ts
// attachment.service.ts
import { StorageService } from "standards";
export class AttachmentService {
  constructor(private storageService: StorageService) {}

  @Get(":id/card-no")
  async getIdCardNo(@Req() req, @Param() params, @Res() res) {
    const text = await this.storageService.ocr(params.id);
    // cleaning and parsing of the ocr text
    const idCardNo = text.split("\n").find((l) => l.includes("A"));
    return idCardNo;
  }
}
```

#### Extract structured fields

Instead of cleaning and parsing raw OCR text yourself, you can ask the service to extract specific fields. Pass a map of field names to descriptions of what each field is, and the service returns a map of those field names to their extracted values. Only applicable to images and PDFs.

Results are cached per object and field set. Pass `{ force: true }` to bypass the cache and re-run extraction.

```ts
// attachment.service.ts
import { StorageService } from "standards";
export class AttachmentService {
  constructor(private storageService: StorageService) {}

  async getIdCardDetails(id: string) {
    const fields = await this.storageService.extract(id, {
      name: "Full name of the card holder",
      idCardNo: "The ID card number",
      dateOfBirth: "Date of birth in YYYY-MM-DD format",
    });
    return fields; // { name: "...", idCardNo: "...", dateOfBirth: "..." }
  }
}
```
