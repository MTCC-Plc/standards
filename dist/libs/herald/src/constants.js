"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_SCOPE_NAMES = exports.NOTIFICATION_SCOPES = void 0;
exports.NOTIFICATION_SCOPES = [
    { name: "teams", identifier: "email" },
    { name: "email", identifier: "email" },
    { name: "sms", identifier: "phone" },
];
exports.NOTIFICATION_SCOPE_NAMES = exports.NOTIFICATION_SCOPES.map((s) => s.name);
