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
      heraldApiUrl: process.env.HERALD_URL,
      heraldApiKey: process.env.HERALD_KEY,
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
          heraldApiUrl: configService.get('HERALD_URL'),
          heraldApiKey: configService.get('HERALD_KEY'),
          sendNotification: configService.get('SEND_NOTIFICATION'),
          sourceBaseUrl: configService.get('APP_URL'),
          source: 'App',
        };
      },
    }),
  ]})

```

- `heraldApiUrl` URL of herald API
- `heraldApiKey` API key for herald API. Sent as the `Authorization` header on every request. The key needs the permission of each endpoint being used.
- `source` Source of the notifications to be generated or fetched i.e. the name of the app using this service
- `sourceBaseUrl` Base url of the source frontend. Any `url` passed to a notification is treated as a path relative to this and is prefixed with it.
- `sendNotification` Meant to be used in development. If false is passed, notifications will not be created. If a list of rcnos, emails or phone numbers are passed, will only create notifications for recipients having those rcnos, emails or phone numbers. In production, this can be either be undefined, empty string or 'true'.

Use `HeraldService` in your services that create notifications.
Check [Herald API usage](https://github.com/MTCC-Plc/herald-api?tab=readme-ov-file#usage) for details of all the individual functions. There is a equivalent function in this service for every herald endpoint.

| Method                        | Endpoint                                   | Permission           | Description                                                              |
| ----------------------------- | ------------------------------------------ | -------------------- | ------------------------------------------------------------------------ |
| `create()`                    | `POST /notification`                       | `CreateNotification` | Notify employees over the given scopes. Queued, so it does not send immediately |
| `sendSMS()`                   | `POST /notification/sms`                   | `CreateSMS`          | Send an SMS to a non employee                                            |
| `sendEmail()`                 | `POST /notification/email`                 | `CreateEmail`        | Send an email to a non employee                                          |
| `sendEmailWithAttachments()`  | `POST /notification/email-with-attachments`| `CreateEmail`        | Send an email with attachments. Sent during the request, not queued      |
| `get()`                       | `GET /notification`                        | `ViewNotification`   | Fetch a user's notifications for the source. 10 at a time                |
| `read()`                      | `POST /notification/read`                  | `ReadNotification`   | Mark specific notifications as read                                      |
| `readAll()`                   | `POST /notification/readall`               | `ReadNotification`   | Mark all of a user's notifications in the source as read                 |
| `syncLegacyNotifications()`   | `POST /notification/sync`                  | `CreateNotification` | Port notifications from a legacy system without sending them             |

`source` defaults to the module `source` on every method, so it only needs to be passed when notifying on behalf of another app.

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

### Sending adaptive cards over Teams

Pass `adaptiveCard` to `create()` to have the `teams` scope send an [adaptive card](https://adaptivecards.io/designer) instead of a plain text message. The card is accepted as the card object or as a JSON string of it, and is sent to Teams as given, so the `url` link and the source footer that the normal Teams message adds have to be part of the card itself.

Only the `teams` scope renders the card. Every other scope falls back to `message`, and `message` is also what is stored in the notification log and shown in the in-app notification list, so it stays required and should describe the card.

```ts
import { HeraldService } from "standards";

export class RandomService {
  constructor(private heraldService: HeraldService) {}

  async requestApproval() {
    await this.heraldService.create({
      message: "Leave request from Ahmed",
      recipients: [{ rcno: 7145 }],
      scopes: ["teams"],
      adaptiveCard: {
        type: "AdaptiveCard",
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.4",
        body: [
          {
            type: "TextBlock",
            text: "Leave request",
            weight: "Bolder",
            size: "Medium",
          },
          {
            type: "FactSet",
            facts: [
              { title: "From", value: "Ahmed" },
              { title: "Days", value: "3" },
            ],
          },
        ],
        actions: [
          {
            type: "Action.OpenUrl",
            title: "View",
            url: "https://my.mtcc.com.mv/leave/approvals",
          },
        ],
      },
    });
  }
}
```

Herald validates the card on the request, so an invalid card throws instead of failing later in its queue. The card must be an object with `type` set to `AdaptiveCard` and a `body` or `actions` array. `version` defaults to `1.4` when not given.

Note that `url` on the notification is still used by the other scopes and the in-app notification, so keep passing it even when the card has its own `Action.OpenUrl`. Unlike `url`, links inside the card are not prefixed with `sourceBaseUrl`.

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

Herald accepts a maximum of `MAX_EMAIL_ATTACHMENT_COUNT` (10) attachments of `MAX_EMAIL_ATTACHMENT_SIZE` (10 MB) each. Both constants are exported, and this method throws a `BadRequestException` before making the request if either is exceeded.

### Fetching and reading notifications

`get()` returns the notifications of a single user for the source, 10 at a time, newest first. `source` defaults to the module source, and one of `rcno`, `email` or `phone` is required. Pass `beforeId` with the id of the oldest notification you already have to page with a load more.

```ts
const notifications = await this.heraldService.get({ rcno: 7145 });
const older = await this.heraldService.get({
  rcno: 7145,
  read: false,
  beforeId: notifications[notifications.length - 1].id,
});
```

Each result is a `RecipientNotification`, which is one row per recipient rather than per notification:

```ts
interface RecipientNotification {
  id: number;
  createdAt: Date;
  requestId: string;
  source: string;
  message: string;
  url?: string;
  rcno?: number;
  read: boolean;
}
```

`read()` marks specific notifications of a user as read using the `requestId`s from the results above. `readAll()` marks every notification of a user in the source as read.

```ts
await this.heraldService.read({
  rcno: 7145,
  requestIds: ["2dde4594-2c34-4f75-89aa-9fea465e2581"],
});
await this.heraldService.readAll({ rcno: 7145 });
```

Note that these endpoints are better called over graphql straight from the frontend where the app uses AD auth, to avoid the extra hop through the app backend. See the [Herald API usage](https://github.com/MTCC-Plc/herald-api?tab=readme-ov-file#usage) notes.
