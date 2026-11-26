/**
 * Values accepted by trail-api's POST /entry. An entry with any other value
 * for these fields is rejected with 400 and lost, so the interceptor maps
 * anything else to "unknown" (or drops operationType) before sending.
 */
export const TRAIL_USER_TYPES = [
  "employee",
  "customer",
  "key",
  "partTimeDriver",
  "unknown",
] as const;

export const TRAIL_USER_IDENTIFIER_TYPES = [
  "rcno",
  "uuid",
  "nid",
  "email",
  "keyName",
  "id",
  "phone",
  "unknown",
] as const;

export const TRAIL_OPERATION_TYPES = [
  "query",
  "mutation",
  "subscription",
  "get",
  "post",
  "put",
  "delete",
] as const;

export type TrailUserType = (typeof TRAIL_USER_TYPES)[number];
export type TrailUserIdentifierType =
  (typeof TRAIL_USER_IDENTIFIER_TYPES)[number];
export type TrailOperationType = (typeof TRAIL_OPERATION_TYPES)[number];

/** Header used to carry a trace id between services. */
export const TRACE_ID_HEADER = "x-trace-id";

/** Keys whose values are replaced before an entry is sent to trail. */
export const DEFAULT_REDACTED_KEYS = [
  "password",
  "newPassword",
  "oldPassword",
  "privateKey",
  "secret",
  "clientSecret",
  "token",
  "accessToken",
  "refreshToken",
  "idToken",
  "apiKey",
  "authorization",
];
