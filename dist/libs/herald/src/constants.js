"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_EMAIL_ATTACHMENT_SIZE = exports.MAX_EMAIL_ATTACHMENT_COUNT = exports.NOTIFICATION_SCOPE_NAMES = exports.NOTIFICATION_SCOPES = void 0;
exports.NOTIFICATION_SCOPES = [
    { name: "teams", identifier: "email" },
    { name: "email", identifier: "email" },
    { name: "sms", identifier: "phone" },
];
exports.NOTIFICATION_SCOPE_NAMES = exports.NOTIFICATION_SCOPES.map((s) => s.name);
// Enforced by the herald API on /notification/email-with-attachments
exports.MAX_EMAIL_ATTACHMENT_COUNT = 10;
exports.MAX_EMAIL_ATTACHMENT_SIZE = 10 * 1024 * 1024;
