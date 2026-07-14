import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import axios, { Method } from "axios";
import {
  MAX_EMAIL_ATTACHMENT_COUNT,
  MAX_EMAIL_ATTACHMENT_SIZE,
} from "./constants";
import {
  GetNotificationClientInput,
  ReadNotificationInput,
  RecipientNotification,
  SyncNotificationInput,
} from "./dto";
import {
  CreateNotificationInput,
  NotificationRecipientInput,
} from "./dto/create-notification.input";
import { SendEmailWithAttachmentsInput } from "./dto/send-email-with-attachments.input";
import { SendEmailInput } from "./dto/send-email.input";
import { SyncResponse } from "./dto/sync.response";
import { HeraldConfig } from "./herald.module";
import FormData = require("form-data");

@Injectable()
export class HeraldService {
  private logger = new Logger(HeraldService.name);
  constructor(private config: HeraldConfig) {}
  async queryHerald<T>(
    endpoint: string,
    method: Method = "get",
    body?: any,
    arrayBuffer: boolean = false,
    headers?: Record<string, string>,
  ): Promise<T> {
    const requestHeaders = {
      Authorization: this.config.heraldApiKey,
      ...headers,
    };
    const result = await axios
      .request({
        url: `${this.config.heraldApiUrl}/${endpoint}`,
        method,
        headers: requestHeaders,
        data: body,
        responseType: arrayBuffer ? "arraybuffer" : undefined,
      })
      .catch((err) => {
        if (err?.response?.data) {
          const e = err.response.data;
          throw new InternalServerErrorException(`Herald-API: ${e.message}`);
        } else {
          throw new InternalServerErrorException(err);
        }
      });
    return result.data;
  }

  /**
   * Filters recipients against the `sendNotification` config allowlist.
   * Returns the recipients allowed to receive notifications, or `null` when
   * notifications should not be sent at all.
   */
  private filterRecipients(
    recipients: NotificationRecipientInput[],
  ): NotificationRecipientInput[] | null {
    switch (this.config.sendNotification) {
      case "false":
        return null;
      case undefined:
      case "true":
      case "":
        return recipients;
      default:
        const identifiers = this.config.sendNotification.split(",");
        const allowedRecipients = recipients.filter(
          (i) =>
            identifiers.includes(`${i.rcno}`) ||
            identifiers.includes(`${i.email}`) ||
            identifiers.includes(`${i.phone}`),
        );
        return allowedRecipients.length === 0 ? null : allowedRecipients;
    }
  }

  /**
   * Prefixes a source relative url with the configured `sourceBaseUrl`.
   * Returns undefined when no url is given, so that the notification is stored
   * without a url instead of pointing at the bare base url.
   */
  private buildUrl(url?: string): string | undefined {
    if (!url) return undefined;
    return `${this.config.sourceBaseUrl ?? ""}${url}`;
  }

  async create(input: CreateNotificationInput) {
    const source = input.source ?? this.config.source;
    const recipients = this.filterRecipients(input.recipients);
    if (!recipients || recipients.length === 0) return;
    input.recipients = recipients;
    await this.queryHerald("notification", "post", {
      ...input,
      url: this.buildUrl(input.url),
      source,
    });
  }

  async sendSMS(phone: string, message: string) {
    const recipients = this.filterRecipients([{ phone }]);
    if (!recipients) return;
    await this.queryHerald("notification/sms", "post", {
      message,
      recipients,
      source: this.config.source,
    });
  }

  async sendEmail({
    email,
    message,
    url,
    emailHtml,
    emailSubject,
  }: SendEmailInput) {
    const recipients = this.filterRecipients([{ email }]);
    if (!recipients) return;
    await this.queryHerald("notification/email", "post", {
      message,
      recipients,
      source: this.config.source,
      url: this.buildUrl(url),
      emailHtml,
      emailSubject,
    });
  }

  async sendEmailWithAttachments({
    recipients,
    message,
    source,
    url,
    emailHtml,
    emailSubject,
    attachments,
  }: SendEmailWithAttachmentsInput) {
    const filteredRecipients = this.filterRecipients(recipients);
    if (!filteredRecipients) return;

    if (attachments.length > MAX_EMAIL_ATTACHMENT_COUNT) {
      throw new BadRequestException(
        `A maximum of ${MAX_EMAIL_ATTACHMENT_COUNT} attachments can be sent at a time.`,
      );
    }
    for (const attachment of attachments) {
      if (attachment.content.length > MAX_EMAIL_ATTACHMENT_SIZE) {
        throw new BadRequestException(
          `Attachment ${attachment.filename} exceeds the maximum size of ${
            MAX_EMAIL_ATTACHMENT_SIZE / (1024 * 1024)
          } MB.`,
        );
      }
    }

    const formData = new FormData();
    formData.append("message", message);
    formData.append("recipients", JSON.stringify(filteredRecipients));
    formData.append("source", source ?? this.config.source);
    const notificationUrl = this.buildUrl(url);
    if (notificationUrl) {
      formData.append("url", notificationUrl);
    }
    if (emailHtml) {
      formData.append("emailHtml", emailHtml);
    }
    if (emailSubject) {
      formData.append("emailSubject", emailSubject);
    }
    for (const attachment of attachments) {
      formData.append("attachments", attachment.content, {
        filename: attachment.filename,
        contentType: attachment.contentType,
      });
    }

    await this.queryHerald(
      "notification/email-with-attachments",
      "post",
      formData,
      false,
      formData.getHeaders() as Record<string, string>,
    );
  }

  async get({
    source,
    rcno,
    email,
    phone,
    read,
    beforeId,
  }: GetNotificationClientInput): Promise<RecipientNotification[]> {
    const params: Record<string, string | number | boolean | undefined> = {
      source: source ?? this.config.source,
      rcno,
      email,
      phone,
      read,
      beforeId,
    };
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      queryParams.append(key, `${value}`);
    }
    return await this.queryHerald<RecipientNotification[]>(
      `notification?${queryParams.toString()}`,
      "get",
    );
  }

  async read(input: ReadNotificationInput) {
    await this.queryHerald("notification/read", "post", input);
  }

  async readAll(input: GetNotificationClientInput) {
    await this.queryHerald("notification/readall", "post", {
      ...input,
      source: input.source ?? this.config.source,
    });
  }

  async syncLegacyNotifications(
    inputs: SyncNotificationInput[],
  ): Promise<SyncResponse[]> {
    if (inputs.length > 1000) {
      this.logger.warn(
        "Syncing many notifications at once could cause crashes due to lack of memory. It is recommended to sync 1000 or less at a time.",
      );
    }
    const results = await this.queryHerald<SyncResponse[]>(
      "notification/sync",
      "post",
      inputs,
    );
    return results;
  }
}
