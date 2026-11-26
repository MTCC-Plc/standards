import { ExecutionContext } from "@nestjs/common";
import { lastValueFrom, of, throwError } from "rxjs";
import { runWithTraceId } from "./trace-context";
import {
  TrailAuditInterceptor,
  TrailAuditOptions,
  TrailEntry,
} from "./trail-audit.interceptor";
import {
  TRAIL_OPERATION_TYPES,
  TRAIL_USER_IDENTIFIER_TYPES,
  TRAIL_USER_TYPES,
} from "./trail.constants";

function gqlContext(opts: {
  req?: any;
  ctx?: any;
  operation?: string;
  operationName?: string;
  field?: string;
  variables?: any;
}): ExecutionContext {
  const info = {
    operation: {
      operation: opts.operation ?? "query",
      name: opts.operationName ? { value: opts.operationName } : undefined,
    },
    path: { key: opts.field ?? "someField" },
    variableValues: opts.variables ?? {},
  };
  const args = [{}, {}, { req: opts.req ?? {}, ...(opts.ctx ?? {}) }, info];
  return {
    getType: () => "graphql",
    getArgs: () => args,
    getArgByIndex: (i: number) => args[i],
    getClass: () => Object,
    getHandler: () => () => undefined,
    switchToHttp: () => ({}) as any,
    switchToRpc: () => ({}) as any,
    switchToWs: () => ({}) as any,
  } as unknown as ExecutionContext;
}

function httpContext(req: any): ExecutionContext {
  return {
    getType: () => "http",
    getArgs: () => [req, {}, () => undefined],
    getArgByIndex: (i: number) => [req][i],
    getClass: () => Object,
    getHandler: () => () => undefined,
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => ({}) }),
    switchToRpc: () => ({}) as any,
    switchToWs: () => ({}) as any,
  } as unknown as ExecutionContext;
}

function make(options: Partial<TrailAuditOptions> = {}) {
  const posts: { url: string; entry: TrailEntry; config: any }[] = [];
  const post = jest.fn(async (url: string, entry: any, config: any) => {
    posts.push({ url, entry, config });
  });
  const interceptor = new TrailAuditInterceptor({
    trailUrl: "https://trail.test/",
    trailKey: "secret-key",
    appName: "test-api",
    appEnvironment: "production",
    httpClient: { post },
    ...options,
  });
  return { interceptor, posts, post };
}

const flush = () => new Promise((r) => setImmediate(r));

describe("TrailAuditInterceptor", () => {
  it("records a GraphQL query by root field name, without storing the output", async () => {
    const { interceptor, posts } = make();
    const ctx = gqlContext({
      req: { user: { rcno: 1234 }, headers: {} },
      field: "getUserPendingWorkflowRequestApproval",
      operationName: "PendingQuery",
      variables: { userId: "u-1" },
    });

    await lastValueFrom(interceptor.intercept(ctx, { handle: () => of({ big: "result" }) }));
    await flush();

    expect(posts).toHaveLength(1);
    expect(posts[0].url).toBe("https://trail.test/entry");
    expect(posts[0].config.headers.Authorization).toBe("secret-key");
    expect(posts[0].entry).toMatchObject({
      appName: "test-api",
      appEnvironment: "production",
      apiType: "gql",
      userType: "employee",
      userIdentifierType: "rcno",
      userIdentifier: "1234",
      operationType: "query",
      operationName: "getUserPendingWorkflowRequestApproval",
      input: { userId: "u-1" },
      output: {},
      isError: false,
    });
    expect(typeof posts[0].entry.requestId).toBe("string");
  });

  it("can record the client operation name instead", () => {
    const { interceptor } = make({ gqlOperationName: "operation" });
    const entry = interceptor.buildEntry(
      gqlContext({ operationName: "PendingQuery", field: "x" }),
      performance.now(),
      {},
      false
    );
    expect(entry?.operationName).toBe("PendingQuery");
  });

  it("stores mutation output with secrets redacted", () => {
    const { interceptor } = make();
    const entry = interceptor.buildEntry(
      gqlContext({
        operation: "mutation",
        variables: { input: { password: "p", name: "n" } },
      }),
      performance.now(),
      { id: 1, app: { privateKey: "k", appName: "a" }, nested: [{ token: "t" }] },
      false
    );
    expect(entry?.input).toEqual({ input: { password: "[redacted]", name: "n" } });
    expect(entry?.output).toEqual({
      id: 1,
      app: { privateKey: "[redacted]", appName: "a" },
      nested: [{ token: "[redacted]" }],
    });
  });

  it("records errors with a short description", async () => {
    const { interceptor, posts } = make();
    const ctx = gqlContext({ operation: "mutation" });
    const error = Object.assign(new Error("Earlier step must be actioned first"), {
      status: 400,
    });

    await expect(
      lastValueFrom(interceptor.intercept(ctx, { handle: () => throwError(() => error) }))
    ).rejects.toBe(error);
    await flush();

    expect(posts[0].entry.isError).toBe(true);
    expect(posts[0].entry.output).toEqual({
      name: "Error",
      message: "Earlier step must be actioned first",
      status: 400,
    });
  });

  it("records REST requests and normalises the method", () => {
    const { interceptor } = make();
    const entry = interceptor.buildEntry(
      httpContext({
        method: "GET",
        originalUrl: "/workflow-requests/pending-approvals/abc",
        body: {},
        key: { name: "pms" },
        headers: {},
      }),
      performance.now(),
      {},
      false
    );
    expect(entry).toMatchObject({
      apiType: "rest",
      operationType: "get",
      operationName: "/workflow-requests/pending-approvals/abc",
      userType: "key",
      userIdentifierType: "keyName",
      userIdentifier: "pms",
    });
  });

  it("only ever sends values trail-api accepts", () => {
    const { interceptor } = make({
      resolveActor: () =>
        ({ userType: "robot", userIdentifierType: "apiKeyStart", userIdentifier: "" }) as any,
    });
    const entry = interceptor.buildEntry(
      httpContext({ method: "PATCH", url: "/x", headers: {} }),
      performance.now(),
      {},
      false
    )!;
    expect(TRAIL_USER_TYPES).toContain(entry.userType);
    expect(TRAIL_USER_IDENTIFIER_TYPES).toContain(entry.userIdentifierType);
    expect(entry.userIdentifier).toBe("unknown");
    // PATCH is not accepted by trail: the field is dropped, the entry is kept.
    expect(entry.operationType).toBeUndefined();
    expect(TRAIL_OPERATION_TYPES).not.toContain("patch");
  });

  it("records unauthenticated requests as unknown instead of dropping them", () => {
    const { interceptor } = make();
    const entry = interceptor.buildEntry(gqlContext({}), performance.now(), {}, false);
    expect(entry).toMatchObject({
      userType: "unknown",
      userIdentifierType: "unknown",
      userIdentifier: "unknown",
    });
  });

  it("uses a custom actor resolver, seeing fields from the GraphQL context too", () => {
    const resolveActor = jest.fn((req: any) =>
      req.user?.tokenType === "app"
        ? ({ userType: "key", userIdentifierType: "keyName", userIdentifier: `app-${req.user.id}` } as const)
        : null
    );
    const { interceptor } = make({ resolveActor });
    const entry = interceptor.buildEntry(
      gqlContext({ req: { user: { tokenType: "app", id: 7 } } }),
      performance.now(),
      {},
      false
    );
    expect(entry?.userIdentifier).toBe("app-7");

    const fromCtx = interceptor.buildEntry(
      gqlContext({ req: {}, ctx: { user: { tokenType: "app", id: 9 } } }),
      performance.now(),
      {},
      false
    );
    expect(fromCtx?.userIdentifier).toBe("app-9");
  });

  it("uses the request trace id, falling back to the current one", () => {
    const { interceptor } = make();
    const fromHeader = interceptor.buildEntry(
      httpContext({ method: "GET", url: "/x", headers: { "x-trace-id": "t-header" } }),
      performance.now(),
      {},
      false
    );
    expect(fromHeader?.traceId).toBe("t-header");

    const fromStore = runWithTraceId("t-store", () =>
      interceptor.buildEntry(httpContext({ method: "GET", url: "/x", headers: {} }), performance.now(), {}, false)
    );
    expect(fromStore?.traceId).toBe("t-store");
  });

  it("skips requests the skip option rejects", async () => {
    const { interceptor, posts } = make({ skip: (_req, name) => name === "/health" });
    await lastValueFrom(
      interceptor.intercept(httpContext({ method: "GET", url: "/health", headers: {} }), {
        handle: () => of("ok"),
      })
    );
    await flush();
    expect(posts).toHaveLength(0);
  });

  it("replaces oversized payloads with a size marker", () => {
    const { interceptor } = make({ maxPayloadBytes: 50 });
    const entry = interceptor.buildEntry(
      gqlContext({ variables: { text: "x".repeat(200) } }),
      performance.now(),
      {},
      false
    );
    expect(entry?.input).toEqual({ _truncated: true, bytes: expect.any(Number) });
  });

  it("handles circular structures", () => {
    const { interceptor } = make();
    const a: any = { name: "a" };
    a.self = a;
    const entry = interceptor.buildEntry(
      gqlContext({ operation: "mutation" }),
      performance.now(),
      a,
      false
    );
    expect(entry?.output).toEqual({ name: "a", self: "[circular]" });
  });

  it("never fails the request when trail is down, and caps entries in flight", async () => {
    let release!: () => void;
    const pending = new Promise<void>((r) => (release = r));
    const post = jest.fn(() => pending.then(() => Promise.reject(new Error("down"))));
    const interceptor = new TrailAuditInterceptor({
      trailUrl: "https://trail.test",
      trailKey: "k",
      appName: "test-api",
      maxInFlight: 2,
      httpClient: { post },
    });

    for (let i = 0; i < 5; i++) {
      await expect(
        lastValueFrom(
          interceptor.intercept(httpContext({ method: "GET", url: `/x${i}`, headers: {} }), {
            handle: () => of(i),
          })
        )
      ).resolves.toBe(i);
    }
    expect(post).toHaveBeenCalledTimes(2);
    release();
    await flush();
    await flush();
  });

  it("defaults appEnvironment to unknown when NODE_ENV is empty", () => {
    const saved = process.env.NODE_ENV;
    process.env.NODE_ENV = "";
    try {
      const interceptor = new TrailAuditInterceptor({
        trailUrl: "x",
        trailKey: "k",
        appName: "a",
        httpClient: { post: async () => undefined },
      });
      const entry = interceptor.buildEntry(gqlContext({}), performance.now(), {}, false);
      expect(entry?.appEnvironment).toBe("unknown");
    } finally {
      process.env.NODE_ENV = saved;
    }
  });
});
