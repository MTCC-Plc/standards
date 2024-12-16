## Standard Logger

Custom Nestjs logger to skip logging the startup logs which makes it difficult to read logs. It also reduces size of logs on disk.

### Usage

Pass the logger when initializing the Nestjs app.

```ts
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  logger: new InternalDisabledLogger(),
});
```
