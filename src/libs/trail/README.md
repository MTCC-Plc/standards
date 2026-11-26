## Trail

Audit trail integration: records every GraphQL resolver call and REST request in trail-api, and carries a trace id across services so one user action can be followed from app to app.

### Usage

Create a key in trail-api with the `CreateEntry` permission, then register the middleware and the interceptor in `main.ts`.

```ts
// main.ts
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import {
  addTracePropagation,
  createTraceMiddleware,
  TrailAuditInterceptor,
} from 'standards';

const app = await NestFactory.create(AppModule);

// Reuse the caller's x-trace-id (or create one) and forward it on outgoing calls.
app.use(createTraceMiddleware());
addTracePropagation(axios, app.get(HttpService).axiosRef);

if (process.env.TRAIL_URL && process.env.TRAIL_KEY) {
  app.useGlobalInterceptors(
    new TrailAuditInterceptor({
      trailUrl: process.env.TRAIL_URL,
      trailKey: process.env.TRAIL_KEY,
      appName: 'my-api',
    }),
  );
}
```

### Who made the request

By default the caller is taken from `key.name` (API key), `user.rcno` / `userObj.rcno` (employee), `customerEmail` or `partTimeDriver`, on the request or the GraphQL context. Apps with a different auth shape pass `resolveActor`:

```ts
new TrailAuditInterceptor({
  trailUrl, trailKey, appName: 'my-api',
  resolveActor: (req) =>
    req.user?.rcno
      ? { userType: 'employee', userIdentifierType: 'rcno', userIdentifier: req.user.rcno }
      : null, // recorded as "unknown"
});
```

Only values trail-api accepts are sent (see `trail.constants.ts`); anything else is recorded as `unknown`, so entries are never rejected.

### What is recorded

- GraphQL: the root field name (`gqlOperationName: 'operation'` records the client's operation name instead), variables as input.
- REST: method and URL, body as input.
- Output: GraphQL mutations only by default (`recordOutput` to change). Errors always record their name, message and status.
- Keys such as `password`, `privateKey` and `token` are redacted (`redactKeys` to add more). Inputs and outputs over 100 KB are replaced with their size (`maxPayloadBytes`).

### Failure handling

Entries are sent in the background and never delay or fail the request. Each send times out after 10 s, at most 200 are in flight (more are dropped), and failures are logged at most once a minute with counts.
