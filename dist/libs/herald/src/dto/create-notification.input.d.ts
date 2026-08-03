export type AdaptiveCard = Record<string, any> | string;
export declare class CreateNotificationInput {
    recipients: NotificationRecipientInput[];
    source?: string;
    message: string;
    url?: string;
    emailHtml?: string;
    emailSubject?: string;
    adaptiveCard?: AdaptiveCard;
    scopes?: string[];
    sendAllScopes?: boolean;
    ignoreLimit?: boolean;
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
