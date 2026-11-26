import {
  addTracePropagation,
  createTraceMiddleware,
  getCurrentTraceId,
  getTraceIdFromRequest,
  runWithTraceId,
} from "./trace-context";

function fakeAxios() {
  const handlers: ((config: any) => any)[] = [];
  return {
    interceptors: { request: { use: (fn: (c: any) => any) => handlers.push(fn) } },
    run: (config: any) => handlers.reduce((c, h) => h(c), config),
    handlers,
  };
}

describe("trace context", () => {
  it("keeps the caller's trace id and echoes it back", () => {
    const req: any = { headers: { "x-trace-id": "abc" } };
    const res = { setHeader: jest.fn() };
    let inside: string | undefined;
    createTraceMiddleware()(req, res, () => {
      inside = getCurrentTraceId();
    });
    expect(req.traceId).toBe("abc");
    expect(inside).toBe("abc");
    expect(res.setHeader).toHaveBeenCalledWith("x-trace-id", "abc");
    expect(getCurrentTraceId()).toBeUndefined();
  });

  it("creates a trace id when the caller sent none", () => {
    const req: any = { headers: {} };
    createTraceMiddleware()(req, { setHeader: () => undefined }, () => undefined);
    expect(req.traceId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("bounds the length of a caller-supplied trace id", () => {
    expect(getTraceIdFromRequest({ headers: { "x-trace-id": "a".repeat(500) } })).toHaveLength(128);
  });

  it("forwards the current trace id on outgoing axios calls", () => {
    const axios = fakeAxios();
    addTracePropagation(axios as any);
    addTracePropagation(axios as any); // idempotent
    expect(axios.handlers).toHaveLength(1);

    expect(axios.run({ headers: {} }).headers).toEqual({});
    const config = runWithTraceId("t-1", () => axios.run({ headers: {} }));
    expect(config.headers["x-trace-id"]).toBe("t-1");
  });

  it("does not overwrite a trace id the caller set explicitly", () => {
    const axios = fakeAxios();
    addTracePropagation(axios as any);
    const config = runWithTraceId("t-1", () => axios.run({ headers: { "x-trace-id": "mine" } }));
    expect(config.headers["x-trace-id"]).toBe("mine");
  });

  it("works with AxiosHeaders-style header objects", () => {
    const axios = fakeAxios();
    addTracePropagation(axios as any);
    const store = new Map<string, string>();
    const headers = { get: (k: string) => store.get(k), set: (k: string, v: string) => store.set(k, v) };
    runWithTraceId("t-2", () => axios.run({ headers }));
    expect(store.get("x-trace-id")).toBe("t-2");
  });
});
