"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTraceId = getCurrentTraceId;
exports.getTraceIdFromRequest = getTraceIdFromRequest;
exports.runWithTraceId = runWithTraceId;
exports.createTraceMiddleware = createTraceMiddleware;
exports.addTracePropagation = addTracePropagation;
const async_hooks_1 = require("async_hooks");
const crypto_1 = require("crypto");
const trail_constants_1 = require("./trail.constants");
/**
 * Per-request trace id, so one user action can be followed across services in
 * trail. Incoming requests keep the caller's `x-trace-id` (or get a new one),
 * and outgoing axios calls made while handling the request forward it.
 */
const storage = new async_hooks_1.AsyncLocalStorage();
const PROPAGATION_CONFIGURED = Symbol.for("standards.trail.tracePropagation");
function readTraceId(headers) {
    var _a;
    const value = (_a = headers === null || headers === void 0 ? void 0 : headers[trail_constants_1.TRACE_ID_HEADER]) !== null && _a !== void 0 ? _a : headers === null || headers === void 0 ? void 0 : headers["trace-id"];
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string" && first.trim().length > 0) {
        // Bound the length so a caller cannot inject an arbitrarily large value.
        return first.trim().slice(0, 128);
    }
    return undefined;
}
/** The trace id of the request currently being handled, if any. */
function getCurrentTraceId() {
    var _a;
    return (_a = storage.getStore()) === null || _a === void 0 ? void 0 : _a.traceId;
}
/** The trace id attached to a request by the middleware, or sent by the caller. */
function getTraceIdFromRequest(request) {
    if (typeof (request === null || request === void 0 ? void 0 : request.traceId) === "string" && request.traceId.trim()) {
        return request.traceId.trim();
    }
    return readTraceId(request === null || request === void 0 ? void 0 : request.headers);
}
/** Runs `fn` with the given trace id as the current one (useful in jobs and tests). */
function runWithTraceId(traceId, fn) {
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
function createTraceMiddleware() {
    return (request, response, next) => {
        var _a;
        const traceId = (_a = readTraceId(request.headers)) !== null && _a !== void 0 ? _a : (0, crypto_1.randomUUID)();
        request.traceId = traceId;
        response.setHeader(trail_constants_1.TRACE_ID_HEADER, traceId);
        storage.run({ traceId }, () => next());
    };
}
/**
 * Makes an axios instance send the current trace id on every request. Safe to
 * call more than once for the same instance. Pass every instance the app uses
 * for service-to-service calls, e.g. `axios` and `httpService.axiosRef`.
 */
function addTracePropagation(...instances) {
    for (const instance of instances) {
        const target = instance;
        if (!target || target[PROPAGATION_CONFIGURED])
            continue;
        target.interceptors.request.use((config) => {
            const traceId = getCurrentTraceId();
            if (!traceId)
                return config;
            const headers = config.headers;
            if (typeof (headers === null || headers === void 0 ? void 0 : headers.get) === "function" && typeof (headers === null || headers === void 0 ? void 0 : headers.set) === "function") {
                // axios >= 1 AxiosHeaders
                if (!headers.get(trail_constants_1.TRACE_ID_HEADER) && !headers.get("trace-id")) {
                    headers.set(trail_constants_1.TRACE_ID_HEADER, traceId);
                }
            }
            else {
                const plain = headers !== null && headers !== void 0 ? headers : {};
                if (!plain[trail_constants_1.TRACE_ID_HEADER] && !plain["trace-id"]) {
                    plain[trail_constants_1.TRACE_ID_HEADER] = traceId;
                }
                config.headers = plain;
            }
            return config;
        });
        target[PROPAGATION_CONFIGURED] = true;
    }
}
