export const NOTIFICATION_SCOPES = [
  { name: "teams", identifier: "email" },
  { name: "email", identifier: "email" },
  { name: "sms", identifier: "phone" },
];

export const NOTIFICATION_SCOPE_NAMES = NOTIFICATION_SCOPES.map((s) => s.name);
