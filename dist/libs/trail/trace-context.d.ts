export type TraceRequestLike = {
    traceId?: string;
    headers?: Record<string, unknown>;
};
/** Minimal shape of an axios instance (axios, axios.create(), HttpService.axiosRef). */
export interface AxiosLike {
    interceptors: {
        request: {
            use: (onFulfilled: (config: any) => any) => unknown;
        };
    };
}
/** The trace id of the request currently being handled, if any. */
export declare function getCurrentTraceId(): string | undefined;
/** The trace id attached to a request by the middleware, or sent by the caller. */
export declare function getTraceIdFromRequest(request?: TraceRequestLike): string | undefined;
/** Runs `fn` with the given trace id as the current one (useful in jobs and tests). */
export declare function runWithTraceId<T>(traceId: string, fn: () => T): T;
/**
 * Express middleware: reuses the caller's trace id or creates one, stores it
 * on `req.traceId`, echoes it in the response header, and makes it the
 * current trace id for everything that runs while handling the request.
 *
 * ```ts
 * app.use(createTraceMiddleware());
 * ```
 */
export declare function createTraceMiddleware(): (request: TraceRequestLike, response: {
    setHeader: (name: string, value: string) => unknown;
}, next: () => void) => void;
/**
 * Makes an axios instance send the current trace id on every request. Safe to
 * call more than once for the same instance. Pass every instance the app uses
 * for service-to-service calls, e.g. `axios` and `httpService.axiosRef`.
 */
export declare function addTracePropagation(...instances: AxiosLike[]): void;
