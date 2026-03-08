## Herald

Nestjs library for herald API integration.

### Usage

Register the HeraldModule in the AppModule and pass in the configurations.

```ts
// app.module.ts
import { HeraldModule } from 'standards';
@Module({
  imports: [
    HeraldModule.register({
      baseUrl: process.env.HERALD_URL,
      apiKey: process.env.HERALD_KEY,
      sendNotification: process.env.SEND_NOTIFICATION,
      sourceBaseUrl: process.env.APP_URL,
      source: 'App'
    }),
  ]})
// or if using configService or something similar
@Module({
  imports: [
    HeraldModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          baseUrl: configService.get('HERALD_URL'),
          apiKey: configService.get('HERALD_KEY'),
          sendNotification: configService.get('SEND_NOTIFICATION'),
          sourceBaseUrl: configService.get('APP_URL'),
          source: 'App',
        };
      },
    }),
  ]})

```

- `heraldApiUrl` URL of herald API
- `heraldApiKey` API key for herald API
- `source` Source of the notifications to be generated or fetched i.e. the name of the app using this service
- `sourceBaseUrl` Base url of the source frontend
- `sendNotification` Meant to be used in development. If false is passed, notifications will not be created. If a list of rcnos, emails or phone numbers are passed, will only create notifications for recipients having those rcnos, emails or phone numbers. In production, this can be either be undefined, empty string or 'true'.

Use `HeraldService` in your services that create notifications.
Check [Herald API usage](https://github.com/MTCC-Plc/herald-api?tab=readme-ov-file#usage) for details of all the individual functions. There is a equivalent function in this service for every herald endpoint.

```ts
// random.service.ts
import { HeraldService } from "standards";
export class RandomService {
  constructor(private heraldService: HeraldService) {}
  async assignTask() {
    // db stuff
    await this.heraldService.create({
      message: "You have been assigned to task 123",
      recipients: [{ rcno: 7145 }],
    });
  }
}
```

### Sending emails with attachments

Use `sendEmailWithAttachments()` for the dedicated attachment endpoint. This sends the email directly through Herald using `multipart/form-data`, while the regular `sendEmail()` method remains unchanged.

```ts
import { HeraldService } from "standards";
import { readFile } from "node:fs/promises";

export class RandomService {
  constructor(private heraldService: HeraldService) {}

  async sendReport() {
    const report = await readFile("./report.pdf");

    await this.heraldService.sendEmailWithAttachments({
      message: "Please find the attached report.",
      recipients: [{ email: "ahmed@gmail.com" }],
      emailSubject: "Monthly report",
      attachments: [
        {
          filename: "report.pdf",
          content: report,
          contentType: "application/pdf",
        },
      ],
    });
  }
}
```

`sendEmailWithAttachments()` accepts:

- `recipients`: array of Herald email recipients. Each recipient must include `email`.
- `message`: email body text.
- `source`: optional source override. Defaults to the module source.
- `url`: optional frontend URL path or absolute path segment, prefixed with `sourceBaseUrl`.
- `emailHtml`: optional custom HTML body.
- `emailSubject`: optional email subject.
- `attachments`: array of files with `filename`, `content` as a `Buffer`, and optional `contentType`.
