import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import axios from "axios";
import { randomUUID } from "crypto";
import { Observable, tap } from "rxjs";
import {
  getCurrentTraceId,
  getTraceIdFromRequest,
  TraceRequestLike,
} from "./trace-context";
import {
  DEFAULT_REDACTED_KEYS,
  TRAIL_OPERATION_TYPES,
  TRAIL_USER_IDENTIFIER_TYPES,
  TRAIL_USER_TYPES,
  TrailUserIdentifierType,
  TrailUserType,
} from "./trail.constants";

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
export function defaultTrailActorResolver(
  request: TrailAuditRequest
): TrailActor | null {
  if (request?.key?.name) {
    return {
      userType: "key",
      userIdentifierType: "keyName",
      userIdentifier: request.key.name,
    };
  }
  const rcno = request?.user?.rcno ?? request?.userObj?.rcno;
  if (rcno) {
    return {
      userType: "employee",
      userIdentifierType: "rcno",
      userIdentifier: rcno,
    };
  }
  if (request?.customerEmail) {
    return {
      userType: "customer",
      userIdentifierType: "email",
      userIdentifier: request.customerEmail,
    };
  }
  if (request?.partTimeDriver?.id) {
    return {
      userType: "partTimeDriver",
      userIdentifierType: "id",
      userIdentifier: request.partTimeDriver.id,
    };
  }
  if (request?.partTimeDriver?.personalEmail) {
    return {
      userType: "partTimeDriver",
      userIdentifierType: "email",
      userIdentifier: request.partTimeDriver.personalEmail,
    };
  }
  return null;
}

const UNKNOWN_ACTOR: TrailActor = {
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
export class TrailAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger("TrailAuditInterceptor");
  private readonly options: Required<
    Omit<TrailAuditOptions, "resolveActor" | "recordOutput" | "skip" | "httpClient">
  > &
    TrailAuditOptions;
  private readonly redactKeys: Set<string>;
  private readonly httpClient: NonNullable<TrailAuditOptions["httpClient"]>;
  private inFlight = 0;
  private failuresSinceLastWarn = 0;
  private droppedSinceLastWarn = 0;
  private lastWarnAt = 0;

  constructor(options: TrailAuditOptions) {
    this.options = {
      appEnvironment: process.env.NODE_ENV || "unknown",
      gqlOperationName: "field",
      redactKeys: [],
      maxPayloadBytes: 100_000,
      requestTimeoutMs: 10_000,
      maxInFlight: 200,
      ...options,
    };
    if (!this.options.appEnvironment) this.options.appEnvironment = "unknown";
    this.redactKeys = new Set(
      [...DEFAULT_REDACTED_KEYS, ...this.options.redactKeys].map((k) =>
        k.toLowerCase()
      )
    );
    this.httpClient = options.httpClient ?? axios.create();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType<GqlContextType>();
    if (type !== "graphql" && type !== "http") {
      return next.handle();
    }
    const started = performance.now();
    return next.handle().pipe(
      tap({
        next: (body: unknown) => this.record(context, started, body, false),
        error: (error: unknown) => this.record(context, started, error, true),
      })
    );
  }

  /** Builds and sends the entry. Never throws. */
  private record(
    context: ExecutionContext,
    started: number,
    result: unknown,
    isError: boolean
  ): void {
    try {
      const entry = this.buildEntry(context, started, result, isError);
      if (entry) this.send(entry);
    } catch (error) {
      this.warn(`could not build audit entry: ${(error as Error)?.message}`);
    }
  }

  /** Exposed for tests. Returns null when the request is skipped. */
  buildEntry(
    context: ExecutionContext,
    started: number,
    result: unknown,
    isError: boolean
  ): TrailEntry | null {
    const timeTakenMs = Math.round(performance.now() - started);
    let request: TrailAuditRequest;
    let apiType: "gql" | "rest";
    let operationType: string | undefined;
    let operationName: string | undefined;
    let input: unknown;

    if (context.getType<GqlContextType>() === "graphql") {
      const gql = GqlExecutionContext.create(context);
      const gqlContext = gql.getContext() ?? {};
      const info = gql.getInfo();
      // Resolvers and guards may put the caller on the GraphQL context rather
      // than on req, so merge both.
      request = { ...(gqlContext.req ?? {}), ...withoutReq(gqlContext) };
      apiType = "gql";
      operationType = info?.operation?.operation;
      operationName =
        this.options.gqlOperationName === "operation"
          ? info?.operation?.name?.value ?? `${info?.path?.key ?? ""}`
          : `${info?.path?.key ?? info?.operation?.name?.value ?? ""}`;
      input = info?.variableValues;
    } else {
      request = context.switchToHttp().getRequest() ?? {};
      apiType = "rest";
      operationType = request.method;
      operationName = request.originalUrl ?? request.url;
      input = request.body;
    }

    if (this.options.skip?.(request, operationName)) return null;

    const actor =
      (this.options.resolveActor ?? defaultTrailActorResolver)(request) ??
      UNKNOWN_ACTOR;
    const normalizedOperationType = operationType?.toLowerCase();

    const base = {
      requestId: randomUUID(),
      traceId: getTraceIdFromRequest(request) ?? getCurrentTraceId(),
      appName: this.options.appName,
      appEnvironment: this.options.appEnvironment,
      apiType,
      ...validActor(actor),
      // trail rejects unknown operation types; drop the field rather than the entry.
      operationType: (TRAIL_OPERATION_TYPES as readonly string[]).includes(
        normalizedOperationType ?? ""
      )
        ? normalizedOperationType
        : undefined,
      operationName,
      timeTakenMs,
      isError,
    };

    const recordOutput = this.options.recordOutput
      ? this.options.recordOutput(base)
      : normalizedOperationType === "mutation";

    return {
      ...base,
      input: this.sanitize(input),
      output: isError
        ? describeError(result)
        : recordOutput
          ? this.sanitize(result)
          : {},
    };
  }

  private send(entry: TrailEntry): void {
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
      .catch((error: any) => {
        this.failuresSinceLastWarn++;
        this.warn(
          error?.response?.data?.message ?? error?.message ?? String(error)
        );
      })
      .finally(() => {
        this.inFlight--;
      });
  }

  /** At most one warning a minute, with counts, so a trail outage cannot flood the logs. */
  private warn(message: string): void {
    const now = Date.now();
    if (now - this.lastWarnAt < 60_000) return;
    this.logger.warn(
      `Audit trail: ${message} (failed: ${this.failuresSinceLastWarn}, dropped: ${this.droppedSinceLastWarn} since last warning)`
    );
    this.lastWarnAt = now;
    this.failuresSinceLastWarn = 0;
    this.droppedSinceLastWarn = 0;
  }

  /** Redacts secrets and replaces oversized payloads with a size marker. */
  private sanitize(value: unknown): unknown {
    if (value === undefined) return {};
    const redacted = redact(value, this.redactKeys, new WeakSet(), 0);
    let json: string | undefined;
    try {
      json = JSON.stringify(redacted);
    } catch {
      return { _unserializable: true };
    }
    const bytes = json ? Buffer.byteLength(json) : 0;
    if (bytes > this.options.maxPayloadBytes) {
      return { _truncated: true, bytes };
    }
    return redacted;
  }
}

function withoutReq(gqlContext: Record<string, unknown>) {
  const { req, res, ...rest } = gqlContext as any;
  return rest;
}

function validActor(actor: TrailActor) {
  const userType = (TRAIL_USER_TYPES as readonly string[]).includes(
    actor.userType
  )
    ? actor.userType
    : "unknown";
  const userIdentifierType = (
    TRAIL_USER_IDENTIFIER_TYPES as readonly string[]
  ).includes(actor.userIdentifierType)
    ? actor.userIdentifierType
    : "unknown";
  const identifier = `${actor.userIdentifier ?? ""}`.trim();
  return {
    userType: userType as TrailUserType,
    userIdentifierType: userIdentifierType as TrailUserIdentifierType,
    userIdentifier: identifier || "unknown",
  };
}

function describeError(error: unknown) {
  const e = error as any;
  return {
    name: e?.name,
    message: typeof e?.message === "string" ? e.message.slice(0, 2000) : String(e),
    status: e?.status ?? e?.statusCode ?? e?.extensions?.code,
  };
}

const MAX_DEPTH = 20;

function redact(
  value: unknown,
  keys: Set<string>,
  seen: WeakSet<object>,
  depth: number
): unknown {
  if (value === null || typeof value !== "object") {
    return typeof value === "function" || typeof value === "symbol"
      ? undefined
      : typeof value === "bigint"
        ? value.toString()
        : value;
  }
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return `[binary ${value.length} bytes]`;
  if (seen.has(value) || depth >= MAX_DEPTH) return "[circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, keys, seen, depth + 1));
  }
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = keys.has(key.toLowerCase())
      ? "[redacted]"
      : redact(item, keys, seen, depth + 1);
  }
  return out;
}
