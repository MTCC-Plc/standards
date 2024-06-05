export declare class CreateNotificationInput {
    recipients: NotificationRecipientInput[];
    source: string;
    message: string;
    url?: string;
    emailHtml?: string;
    scopes?: string[];
    sendAllScopes?: boolean;
}
export declare class NotificationRecipientInput {
    rcno?: number;
    email?: string;
    phone?: string;
    flaggedForFetch?: boolean;
    scopes?: NotificationRecipientScope[];
}
export declare class NotificationRecipientScope {
    name: string;
    sent: boolean;
    error: boolean;
}
