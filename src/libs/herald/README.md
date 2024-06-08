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
          source: 'App',
        };
      },
    }),
  ]})

```

- `baseUrl` Base URL of herald API
- `apiKey` API key for herald API
- `source` Source of the notifications to be generated or fetched i.e. the name of the app using this service
- `sendNotification` Meant to be used in development. If false is passed, notifications will not be created. If a list of rcnos are passed, will only create notifications for those employees. In production, this can be either be undefined, empty string or 'true'.

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
