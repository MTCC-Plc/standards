import { IsArray, IsOptional, IsString } from "class-validator";
import { NotificationRecipientInput } from "./create-notification.input";

export interface EmailAttachmentUploadInput {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export class SendEmailWithAttachmentsInput {
  @IsArray()
  recipients: NotificationRecipientInput[];

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  emailHtml?: string;

  @IsString()
  @IsOptional()
  emailSubject?: string;

  @IsArray()
  attachments: EmailAttachmentUploadInput[];
}
