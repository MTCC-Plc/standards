## Napis

National APIs integration.

### Usage

Register the NapisModule in the AppModule and pass in the configurations.

```ts
// app.module.ts
import { NapisModule } from 'standards';
@Module({
  imports: [
    NapisModule.forRoot({
      host: process.env.NAPIS_HOST,
      appKey: process.env.NAPIS_KEY,
    }),
  ]})
// or if using configService/settingService or something similar
@Module({
  imports: [
    NapisModule.forRootAsync({
      imports: [SettingModule],
      inject: [SettingService],
      useFactory: async (settingService: SettingService) => {
        const [host, appKey] = await settingService.findMany([
          'napisUrl',
          'napisKey',
        ]);
        return {
          host,
          appKey,
        };
      },
    }),
  ]})

```

- `host` URL of the Napis service.
- `appKey` (Optional) App key for authenticating with the Napis service.

Use `NapisService` in relevant services/controllers/resolvers.

#### Check if person is PWD

Check if a person is registered as a Person with Disability (PWD).

```ts
import { NapisService } from "standards";
@Injectable()
export class UserService {
  constructor(private napisService: NapisService) {}

  async checkPwd(nid: string) {
    const result = await this.napisService.isPwd(nid);
    // result: { isPwd: boolean, type?: string }
    return result;
  }
}
```

#### Validate identity information

Validate identity information against the DNR (Department of National Registration) database.

```ts
import { NapisService } from "standards";
@Injectable()
export class UserService {
  constructor(private napisService: NapisService) {}

  async validateUser(nid: string, name: string, dob: string) {
    const result = await this.napisService.isValid({
      nid,
      name,
      dob,
      // Optional fields: atoll, island, home
    });
    // result: { isValid: boolean, errors?: number[], dob?: string }
    if (!result.isValid) {
      throw new Error("Invalid identity information");
    }
    return result;
  }
}
```

#### Check if person is over 18

Check if a person is over 18 years old based on their National ID.

```ts
import { NapisService } from "standards";
@Injectable()
export class UserService {
  constructor(private napisService: NapisService) {}

  async verifyAge(nid: string) {
    const isOver18 = await this.napisService.isOver18(nid);
    if (!isOver18) {
      throw new Error("User must be over 18");
    }
    return isOver18;
  }
}
```

#### Get basic information

Retrieve basic information for a National ID.

```ts
import { NapisService } from "standards";
@Injectable()
export class UserService {
  constructor(private napisService: NapisService) {}

  async getBasicInfo(nid: string) {
    const info = await this.napisService.getBasic(nid);
    // info: { name: string, dob: string, atoll: string, island: string, home: string }
    return info;
  }
}
```

#### Custom Napis queries

For custom queries not covered by the helper methods, use the `queryNapis` method directly.

```ts
import { NapisService } from "standards";
@Injectable()
export class UserService {
  constructor(private napisService: NapisService) {}

  async customQuery() {
    const result = await this.napisService.queryNapis({
      endpoint: "custom/endpoint",
      method: "get",
      // Optional: body, headers, responseType
    });
    return result.data;
  }
}
```
