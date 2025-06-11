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
// or if using configService or something similar
@Module({
  imports: [
    StorageModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          host: configService.get('STORAGE_HOST'),
          appKey: configService.get('STORAGE_KEY'),
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
    const objectId = await this.storageService.upload(file);
    try {
      // db stuff, notifications, etc
      // store objectId in the app's db here
    } catch (e) {
      await this.storageService.delete(objectId);
      throw e;
    }
  }
}
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
