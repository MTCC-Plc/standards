import { Method } from "axios";
import { GetNotificationClientInput, ReadNotificationInput, RecipientNotification, SyncNotificationInput } from "./dto";
import { CreateNotificationInput } from "./dto/create-notification.input";
import { SendEmailWithAttachmentsInput } from "./dto/send-email-with-attachments.input";
import { SendEmailInput } from "./dto/send-email.input";
import { SyncResponse } from "./dto/sync.response";
import { HeraldConfig } from "./herald.module";
export declare class HeraldService {
    private config;
    private logger;
    constructor(config: HeraldConfig);
    queryHerald<T>(endpoint: string, method?: Method, body?: any, arrayBuffer?: boolean, headers?: Record<string, string>): Promise<T>;
    /**
     * Filters recipients against the `sendNotification` config allowlist.
     * Returns the recipients allowed to receive notifications, or `null` when
     * notifications should not be sent at all.
     */
    private filterRecipients;
    /**
     * Prefixes a source relative url with the configured `sourceBaseUrl`.
     * Returns undefined when no url is given, so that the notification is stored
     * without a url instead of pointing at the bare base url.
     */
    private buildUrl;
    create(input: CreateNotificationInput): Promise<void>;
    sendSMS(phone: string, message: string): Promise<void>;
    sendEmail({ email, message, url, emailHtml, emailSubject, }: SendEmailInput): Promise<void>;
    sendEmailWithAttachments({ recipients, message, source, url, emailHtml, emailSubject, attachments, }: SendEmailWithAttachmentsInput): Promise<void>;
    get({ source, rcno, email, phone, read, beforeId, }: GetNotificationClientInput): Promise<RecipientNotification[]>;
    read(input: ReadNotificationInput): Promise<void>;
    readAll(input: GetNotificationClientInput): Promise<void>;
    syncLegacyNotifications(inputs: SyncNotificationInput[]): Promise<SyncResponse[]>;
}
