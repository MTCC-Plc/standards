## Cluster

Nestjs service for clustering an API to run multiple forks of the same app.

### Usage

Simply pass the app startup function into the clusterize function. Optionally
pass in the preferred number of forks.

```ts
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ClusterService } from "./app-cluster.service";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.listen(port || 3000);
}

ClusterService.clusterize(bootstrap, 5);
```
