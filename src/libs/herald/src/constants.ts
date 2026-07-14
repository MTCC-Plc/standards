export const NOTIFICATION_SCOPES = [
  { name: "teams", identifier: "email" },
  { name: "email", identifier: "email" },
  { name: "sms", identifier: "phone" },
];

export const NOTIFICATION_SCOPE_NAMES = NOTIFICATION_SCOPES.map((s) => s.name);

// Enforced by the herald API on /notification/email-with-attachments
export const MAX_EMAIL_ATTACHMENT_COUNT = 10;
export const MAX_EMAIL_ATTACHMENT_SIZE = 10 * 1024 * 1024;
