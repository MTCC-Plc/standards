import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { TraceRequestLike } from "./trace-context";
import { TrailUserIdentifierType, TrailUserType } from "./trail.constants";
export interface TrailActor {
    userType: TrailUserType;
    userIdentifierType: TrailUserIdentifierType;
    userIdentifier: string | number;
}
/**
 * The request as seen by the interceptor. For GraphQL, fields that resolvers
 * put on the GraphQL context (user, key, ...) are merged over the HTTP request.
 */
export type TrailAuditRequest = TraceRequestLike & {
    method?: string;
    url?: string;
    originalUrl?: string;
    body?: unknown;
    [key: string]: any;
};
export interface TrailEntry {
    requestId: string;
    traceId?: string;
    appName: string;
    appEnvironment: string;
    apiType: "gql" | "rest";
    userType: TrailUserType;
    userIdentifierType: TrailUserIdentifierType;
    userIdentifier: string;
    operationType?: string;
    operationName?: string;
    input: unknown;
    output: unknown;
    timeTakenMs: number;
    isError: boolean;
}
export interface TrailAuditOptions {
    /** trail-api base URL, e.g. https://api-trail.example.com */
    trailUrl: string;
    /** trail-api key with the CreateEntry permission. */
    trailKey: string;
    /** Name the entries are stored under, e.g. "workflow-api". */
    appName: string;
    /** Defaults to NODE_ENV, or "unknown" (trail requires a value). */
    appEnvironment?: string;
    /** Maps a request to who made it. Defaults to `defaultTrailActorResolver`. */
    resolveActor?: (request: TrailAuditRequest) => TrailActor | null | undefined;
    /**
     * GraphQL operation name to record: "field" (the root field resolved, the
     * default) or "operation" (the client's operation name, which may group
     * several fields under one name).
     */
    gqlOperationName?: "field" | "operation";
    /** Whether to store the response. Defaults to GraphQL mutations only. */
    recordOutput?: (entry: Omit<TrailEntry, "output" | "input">) => boolean;
    /** Return true to skip auditing a request (e.g. health checks). */
    skip?: (request: TrailAuditRequest, operationName?: string) => boolean;
    /** Keys whose values are replaced with "[redacted]", in addition to the defaults. */
    redactKeys?: string[];
    /** Larger inputs/outputs are replaced with a size marker. Default 100 KB. */
    maxPayloadBytes?: number;
    /** Timeout for each request to trail. Default 10 s. */
    requestTimeoutMs?: number;
    /** Entries in flight beyond this are dropped instead of queued. Default 200. */
    maxInFlight?: number;
    /** For tests: replaces the HTTP client used to send entries. */
    httpClient?: {
        post: (url: string, data: unknown, config: any) => Promise<unknown>;
    };
}
/**
 * Default actor mapping, covering the request shapes used across the apps:
 * API keys (`key.name`), employees (`user.rcno` / `userObj.rcno`),
 * customers (`customerEmail`) and part-time drivers.
 */
export declare function defaultTrailActorResolver(request: TrailAuditRequest): TrailActor | null;
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
export declare class TrailAuditInterceptor implements NestInterceptor {
    private readonly logger;
    private readonly options;
    private readonly redactKeys;
    private readonly httpClient;
    private inFlight;
    private failuresSinceLastWarn;
    private droppedSinceLastWarn;
    private lastWarnAt;
    constructor(options: TrailAuditOptions);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    /** Builds and sends the entry. Never throws. */
    private record;
    /** Exposed for tests. Returns null when the request is skipped. */
    buildEntry(context: ExecutionContext, started: number, result: unknown, isError: boolean): TrailEntry | null;
    private send;
    /** At most one warning a minute, with counts, so a trail outage cannot flood the logs. */
    private warn;
    /** Redacts secrets and replaces oversized payloads with a size marker. */
    private sanitize;
}
