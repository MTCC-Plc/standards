"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_REDACTED_KEYS = exports.TRACE_ID_HEADER = exports.TRAIL_OPERATION_TYPES = exports.TRAIL_USER_IDENTIFIER_TYPES = exports.TRAIL_USER_TYPES = void 0;
/**
 * Values accepted by trail-api's POST /entry. An entry with any other value
 * for these fields is rejected with 400 and lost, so the interceptor maps
 * anything else to "unknown" (or drops operationType) before sending.
 */
exports.TRAIL_USER_TYPES = [
    "employee",
    "customer",
    "key",
    "partTimeDriver",
    "unknown",
];
exports.TRAIL_USER_IDENTIFIER_TYPES = [
    "rcno",
    "uuid",
    "nid",
    "email",
    "keyName",
    "id",
    "phone",
    "unknown",
];
exports.TRAIL_OPERATION_TYPES = [
    "query",
    "mutation",
    "subscription",
    "get",
    "post",
    "put",
    "delete",
];
/** Header used to carry a trace id between services. */
exports.TRACE_ID_HEADER = "x-trace-id";
/** Keys whose values are replaced before an entry is sent to trail. */
exports.DEFAULT_REDACTED_KEYS = [
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
