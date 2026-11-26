"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrailAuditInterceptor = void 0;
exports.defaultTrailActorResolver = defaultTrailActorResolver;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const axios_1 = require("axios");
const crypto_1 = require("crypto");
const rxjs_1 = require("rxjs");
const trace_context_1 = require("./trace-context");
const trail_constants_1 = require("./trail.constants");
/**
 * Default actor mapping, covering the request shapes used across the apps:
 * API keys (`key.name`), employees (`user.rcno` / `userObj.rcno`),
 * customers (`customerEmail`) and part-time drivers.
 */
function defaultTrailActorResolver(request) {
    var _a, _b, _c, _d, _e, _f;
    if ((_a = request === null || request === void 0 ? void 0 : request.key) === null || _a === void 0 ? void 0 : _a.name) {
        return {
            userType: "key",
            userIdentifierType: "keyName",
            userIdentifier: request.key.name,
        };
    }
    const rcno = (_c = (_b = request === null || request === void 0 ? void 0 : request.user) === null || _b === void 0 ? void 0 : _b.rcno) !== null && _c !== void 0 ? _c : (_d = request === null || request === void 0 ? void 0 : request.userObj) === null || _d === void 0 ? void 0 : _d.rcno;
    if (rcno) {
        return {
            userType: "employee",
            userIdentifierType: "rcno",
            userIdentifier: rcno,
        };
    }
    if (request === null || request === void 0 ? void 0 : request.customerEmail) {
        return {
            userType: "customer",
            userIdentifierType: "email",
            userIdentifier: request.customerEmail,
        };
    }
    if ((_e = request === null || request === void 0 ? void 0 : request.partTimeDriver) === null || _e === void 0 ? void 0 : _e.id) {
        return {
            userType: "partTimeDriver",
            userIdentifierType: "id",
            userIdentifier: request.partTimeDriver.id,
        };
    }
    if ((_f = request === null || request === void 0 ? void 0 : request.partTimeDriver) === null || _f === void 0 ? void 0 : _f.personalEmail) {
        return {
            userType: "partTimeDriver",
            userIdentifierType: "email",
            userIdentifier: request.partTimeDriver.personalEmail,
        };
    }
    return null;
}
const UNKNOWN_ACTOR = {
    userType: "unknown",
    userIdentifierType: "unknown",
    userIdentifier: "unknown",
};
/**
 * Global interceptor that records every GraphQL resolver call and REST request
 * in trail-api. Sending is fire-and-forget: it never delays or fails the
 * request being audited.
 *
 * ```ts
 * app.use(createTraceMiddleware());
 * app.useGlobalInterceptors(
 *   new TrailAuditInterceptor({ trailUrl, trailKey, appName: "my-api" }),
 * );
 * ```
 */
class TrailAuditInterceptor {
    constructor(options) {
        var _a;
        this.logger = new common_1.Logger("TrailAuditInterceptor");
        this.inFlight = 0;
        this.failuresSinceLastWarn = 0;
        this.droppedSinceLastWarn = 0;
        this.lastWarnAt = 0;
        this.options = Object.assign({ appEnvironment: process.env.NODE_ENV || "unknown", gqlOperationName: "field", redactKeys: [], maxPayloadBytes: 100000, requestTimeoutMs: 10000, maxInFlight: 200 }, options);
        if (!this.options.appEnvironment)
            this.options.appEnvironment = "unknown";
        this.redactKeys = new Set([...trail_constants_1.DEFAULT_REDACTED_KEYS, ...this.options.redactKeys].map((k) => k.toLowerCase()));
        this.httpClient = (_a = options.httpClient) !== null && _a !== void 0 ? _a : axios_1.default.create();
    }
    intercept(context, next) {
        const type = context.getType();
        if (type !== "graphql" && type !== "http") {
            return next.handle();
        }
        const started = performance.now();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: (body) => this.record(context, started, body, false),
            error: (error) => this.record(context, started, error, true),
        }));
    }
    /** Builds and sends the entry. Never throws. */
    record(context, started, result, isError) {
        try {
            const entry = this.buildEntry(context, started, result, isError);
            if (entry)
                this.send(entry);
        }
        catch (error) {
            this.warn(`could not build audit entry: ${error === null || error === void 0 ? void 0 : error.message}`);
        }
    }
    /** Exposed for tests. Returns null when the request is skipped. */
    buildEntry(context, started, result, isError) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        const timeTakenMs = Math.round(performance.now() - started);
        let request;
        let apiType;
        let operationType;
        let operationName;
        let input;
        if (context.getType() === "graphql") {
            const gql = graphql_1.GqlExecutionContext.create(context);
            const gqlContext = (_a = gql.getContext()) !== null && _a !== void 0 ? _a : {};
            const info = gql.getInfo();
            // Resolvers and guards may put the caller on the GraphQL context rather
            // than on req, so merge both.
            request = Object.assign(Object.assign({}, ((_b = gqlContext.req) !== null && _b !== void 0 ? _b : {})), withoutReq(gqlContext));
            apiType = "gql";
            operationType = (_c = info === null || info === void 0 ? void 0 : info.operation) === null || _c === void 0 ? void 0 : _c.operation;
            operationName =
                this.options.gqlOperationName === "operation"
                    ? (_f = (_e = (_d = info === null || info === void 0 ? void 0 : info.operation) === null || _d === void 0 ? void 0 : _d.name) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : `${(_h = (_g = info === null || info === void 0 ? void 0 : info.path) === null || _g === void 0 ? void 0 : _g.key) !== null && _h !== void 0 ? _h : ""}`
                    : `${(_o = (_k = (_j = info === null || info === void 0 ? void 0 : info.path) === null || _j === void 0 ? void 0 : _j.key) !== null && _k !== void 0 ? _k : (_m = (_l = info === null || info === void 0 ? void 0 : info.operation) === null || _l === void 0 ? void 0 : _l.name) === null || _m === void 0 ? void 0 : _m.value) !== null && _o !== void 0 ? _o : ""}`;
            input = info === null || info === void 0 ? void 0 : info.variableValues;
        }
        else {
            request = (_p = context.switchToHttp().getRequest()) !== null && _p !== void 0 ? _p : {};
            apiType = "rest";
            operationType = request.method;
            operationName = (_q = request.originalUrl) !== null && _q !== void 0 ? _q : request.url;
            input = request.body;
        }
        if ((_s = (_r = this.options).skip) === null || _s === void 0 ? void 0 : _s.call(_r, request, operationName))
            return null;
        const actor = (_u = ((_t = this.options.resolveActor) !== null && _t !== void 0 ? _t : defaultTrailActorResolver)(request)) !== null && _u !== void 0 ? _u : UNKNOWN_ACTOR;
        const normalizedOperationType = operationType === null || operationType === void 0 ? void 0 : operationType.toLowerCase();
        const base = Object.assign(Object.assign({ requestId: (0, crypto_1.randomUUID)(), traceId: (_v = (0, trace_context_1.getTraceIdFromRequest)(request)) !== null && _v !== void 0 ? _v : (0, trace_context_1.getCurrentTraceId)(), appName: this.options.appName, appEnvironment: this.options.appEnvironment, apiType }, validActor(actor)), { 
            // trail rejects unknown operation types; drop the field rather than the entry.
            operationType: trail_constants_1.TRAIL_OPERATION_TYPES.includes(normalizedOperationType !== null && normalizedOperationType !== void 0 ? normalizedOperationType : "")
                ? normalizedOperationType
                : undefined, operationName,
            timeTakenMs,
            isError });
        const recordOutput = this.options.recordOutput
            ? this.options.recordOutput(base)
            : normalizedOperationType === "mutation";
        return Object.assign(Object.assign({}, base), { input: this.sanitize(input), output: isError
                ? describeError(result)
                : recordOutput
                    ? this.sanitize(result)
                    : {} });
    }
    send(entry) {
        if (this.inFlight >= this.options.maxInFlight) {
            this.droppedSinceLastWarn++;
            this.warn("too many audit entries in flight");
            return;
        }
        this.inFlight++;
        this.httpClient
            .post(`${this.options.trailUrl.replace(/\/+$/, "")}/entry`, entry, {
            headers: { Authorization: this.options.trailKey },
            timeout: this.options.requestTimeoutMs,
        })
            .catch((error) => {
            var _a, _b, _c, _d;
            this.failuresSinceLastWarn++;
            this.warn((_d = (_c = (_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : String(error));
        })
            .finally(() => {
            this.inFlight--;
        });
    }
    /** At most one warning a minute, with counts, so a trail outage cannot flood the logs. */
    warn(message) {
        const now = Date.now();
        if (now - this.lastWarnAt < 60000)
            return;
        this.logger.warn(`Audit trail: ${message} (failed: ${this.failuresSinceLastWarn}, dropped: ${this.droppedSinceLastWarn} since last warning)`);
        this.lastWarnAt = now;
        this.failuresSinceLastWarn = 0;
        this.droppedSinceLastWarn = 0;
    }
    /** Redacts secrets and replaces oversized payloads with a size marker. */
    sanitize(value) {
        if (value === undefined)
            return {};
        const redacted = redact(value, this.redactKeys, new WeakSet(), 0);
        let json;
        try {
            json = JSON.stringify(redacted);
        }
        catch (_a) {
            return { _unserializable: true };
        }
        const bytes = json ? Buffer.byteLength(json) : 0;
        if (bytes > this.options.maxPayloadBytes) {
            return { _truncated: true, bytes };
        }
        return redacted;
    }
}
exports.TrailAuditInterceptor = TrailAuditInterceptor;
function withoutReq(gqlContext) {
    const _a = gqlContext, { req, res } = _a, rest = __rest(_a, ["req", "res"]);
    return rest;
}
function validActor(actor) {
    var _a;
    const userType = trail_constants_1.TRAIL_USER_TYPES.includes(actor.userType)
        ? actor.userType
        : "unknown";
    const userIdentifierType = trail_constants_1.TRAIL_USER_IDENTIFIER_TYPES.includes(actor.userIdentifierType)
        ? actor.userIdentifierType
        : "unknown";
    const identifier = `${(_a = actor.userIdentifier) !== null && _a !== void 0 ? _a : ""}`.trim();
    return {
        userType: userType,
        userIdentifierType: userIdentifierType,
        userIdentifier: identifier || "unknown",
    };
}
function describeError(error) {
    var _a, _b, _c;
    const e = error;
    return {
        name: e === null || e === void 0 ? void 0 : e.name,
        message: typeof (e === null || e === void 0 ? void 0 : e.message) === "string" ? e.message.slice(0, 2000) : String(e),
        status: (_b = (_a = e === null || e === void 0 ? void 0 : e.status) !== null && _a !== void 0 ? _a : e === null || e === void 0 ? void 0 : e.statusCode) !== null && _b !== void 0 ? _b : (_c = e === null || e === void 0 ? void 0 : e.extensions) === null || _c === void 0 ? void 0 : _c.code,
    };
}
const MAX_DEPTH = 20;
function redact(value, keys, seen, depth) {
    if (value === null || typeof value !== "object") {
        return typeof value === "function" || typeof value === "symbol"
            ? undefined
            : typeof value === "bigint"
                ? value.toString()
                : value;
    }
    if (value instanceof Date)
        return value.toISOString();
    if (Buffer.isBuffer(value))
        return `[binary ${value.length} bytes]`;
    if (seen.has(value) || depth >= MAX_DEPTH)
        return "[circular]";
    seen.add(value);
    if (Array.isArray(value)) {
        return value.map((item) => redact(item, keys, seen, depth + 1));
    }
    const out = {};
    for (const [key, item] of Object.entries(value)) {
        out[key] = keys.has(key.toLowerCase())
            ? "[redacted]"
            : redact(item, keys, seen, depth + 1);
    }
    return out;
}
