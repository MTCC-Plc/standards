## Search

Nestjs library for Meilisearch API integration.

### Usage

Register the SearchModule in the AppModule and pass in the configurations.

```ts
// app.module.ts
import { SearchModule } from 'standards';
@Module({
  imports: [
    SearchModule.forRoot({
      host: envConfig.MEILISEARCH_HOST,
      apiKey: envConfig.MEILISEARCH_KEY,
    }),
  ]})
// or if using configService or something similar
@Module({
  imports: [
    SearchModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          host: configService.get('MEILISEARCH_HOST'),
          apiKey: configService.get('MEILISEARCH_KEY'),
        };
      },
    }),
  ]})

```

- `host` URL of meilisearch API
- `apiKey` API key for meilisearch API

Use `SearchService` in to search within an meilisearch index.

```ts
// random.service.ts
import { SearchService } from "standards";
export class RandomService {
  constructor(private searchService: SearchService) {}
  async searchEmployees() {
    const results = await this.searchService.search("employees", query);
    return results.hits;
  }
}
```
