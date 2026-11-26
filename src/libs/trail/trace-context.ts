import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";
import { TRACE_ID_HEADER } from "./trail.constants";

/**
 * Per-request trace id, so one user action can be followed across services in
 * trail. Incoming requests keep the caller's `x-trace-id` (or get a new one),
 * and outgoing axios calls made while handling the request forward it.
 */

const storage = new AsyncLocalStorage<{ traceId: string }>();
const PROPAGATION_CONFIGURED = Symbol.for("standards.trail.tracePropagation");

type Headers = Record<string, unknown> | undefined;

export type TraceRequestLike = {
  traceId?: string;
  headers?: Record<string, unknown>;
};

/** Minimal shape of an axios instance (axios, axios.create(), HttpService.axiosRef). */
export interface AxiosLike {
  interceptors: {
    request: { use: (onFulfilled: (config: any) => any) => unknown };
  };
}

function readTraceId(headers: Headers): string | undefined {
  const value = headers?.[TRACE_ID_HEADER] ?? headers?.["trace-id"];
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first === "string" && first.trim().length > 0) {
    // Bound the length so a caller cannot inject an arbitrarily large value.
    return first.trim().slice(0, 128);
  }
  return undefined;
}

/** The trace id of the request currently being handled, if any. */
export function getCurrentTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}

/** The trace id attached to a request by the middleware, or sent by the caller. */
export function getTraceIdFromRequest(
  request?: TraceRequestLike
): string | undefined {
  if (typeof request?.traceId === "string" && request.traceId.trim()) {
    return request.traceId.trim();
  }
  return readTraceId(request?.headers);
}

/** Runs `fn` with the given trace id as the current one (useful in jobs and tests). */
export function runWithTraceId<T>(traceId: string, fn: () => T): T {
  return storage.run({ traceId }, fn);
}

/**
 * Express middleware: reuses the caller's trace id or creates one, stores it
 * on `req.traceId`, echoes it in the response header, and makes it the
 * current trace id for everything that runs while handling the request.
 *
 * ```ts
 * app.use(createTraceMiddleware());
 * ```
 */
export function createTraceMiddleware() {
  return (
    request: TraceRequestLike,
    response: { setHeader: (name: string, value: string) => unknown },
    next: () => void
  ) => {
    const traceId = readTraceId(request.headers) ?? randomUUID();
    request.traceId = traceId;
    response.setHeader(TRACE_ID_HEADER, traceId);
    storage.run({ traceId }, () => next());
  };
}

/**
 * Makes an axios instance send the current trace id on every request. Safe to
 * call more than once for the same instance. Pass every instance the app uses
 * for service-to-service calls, e.g. `axios` and `httpService.axiosRef`.
 */
export function addTracePropagation(...instances: AxiosLike[]): void {
  for (const instance of instances) {
    const target = instance as AxiosLike & { [PROPAGATION_CONFIGURED]?: true };
    if (!target || target[PROPAGATION_CONFIGURED]) continue;

    target.interceptors.request.use((config: any) => {
      const traceId = getCurrentTraceId();
      if (!traceId) return config;

      const headers = config.headers;
      if (typeof headers?.get === "function" && typeof headers?.set === "function") {
        // axios >= 1 AxiosHeaders
        if (!headers.get(TRACE_ID_HEADER) && !headers.get("trace-id")) {
          headers.set(TRACE_ID_HEADER, traceId);
        }
      } else {
        const plain = headers ?? {};
        if (!plain[TRACE_ID_HEADER] && !plain["trace-id"]) {
          plain[TRACE_ID_HEADER] = traceId;
        }
        config.headers = plain;
      }
      return config;
    });

    target[PROPAGATION_CONFIGURED] = true;
  }
}
