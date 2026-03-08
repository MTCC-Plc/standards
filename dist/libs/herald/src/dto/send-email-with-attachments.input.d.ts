import { NotificationRecipientInput } from "./create-notification.input";
export interface EmailAttachmentUploadInput {
    filename: string;
    content: Buffer;
    contentType?: string;
}
export declare class SendEmailWithAttachmentsInput {
    recipients: NotificationRecipientInput[];
    message: string;
    source?: string;
    url?: string;
    emailHtml?: string;
    emailSubject?: string;
    attachments: EmailAttachmentUploadInput[];
}
