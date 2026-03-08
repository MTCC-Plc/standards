import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import axios, { Method } from "axios";
import {
  GetNotificationInput,
  ReadNotificationInput,
  SyncNotificationInput,
} from "./dto";
import { CreateNotificationInput } from "./dto/create-notification.input";
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

  async create(input: CreateNotificationInput) {
    const source = input.source ?? this.config.source;
    switch (this.config.sendNotification) {
      case "false":
        return;
      case undefined:
      case "true":
      case "":
        break;
      default:
        const identifiers = this.config.sendNotification.split(",");
        const allowedRecipients = [];
        for (const i of input.recipients) {
          if (
            identifiers.includes(`${i.rcno}`) ||
            identifiers.includes(`${i.email}`) ||
            identifiers.includes(`${i.phone}`)
          ) {
            allowedRecipients.push(i);
          }
        }
        if (allowedRecipients.length === 0) return;
        input.recipients = allowedRecipients;
    }
    if (input.recipients.length === 0) return;
    await this.queryHerald("notification", "post", {
      ...input,
      url: `${this.config.sourceBaseUrl ?? ""}${input.url ?? ""}`,
      source,
    });
  }

  async sendSMS(phone: string, message: string) {
    if (this.config.sendNotification === "false") return;
    const input: CreateNotificationInput = {
      message,
      recipients: [{ phone }],
      source: this.config.source,
    };
    await this.queryHerald("notification/sms", "post", {
      ...input,
      url: input.url ? `${this.config.heraldApiKey}${input.url}` : undefined,
      source: this.config.source,
    });
  }

  async sendEmail({ email, message, emailHtml, emailSubject }: SendEmailInput) {
    if (this.config.sendNotification === "false") return;
    const input: CreateNotificationInput = {
      message,
      recipients: [{ email }],
      source: this.config.source,
      emailHtml,
      emailSubject,
    };
    await this.queryHerald("notification/email", "post", {
      ...input,
      url: input.url ? `${this.config.heraldApiKey}${input.url}` : undefined,
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
    if (this.config.sendNotification === "false") return;

    const formData = new FormData();
    formData.append("message", message);
    formData.append("recipients", JSON.stringify(recipients));
    formData.append("source", source ?? this.config.source);
    if (url) {
      formData.append("url", `${this.config.sourceBaseUrl ?? ""}${url}`);
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

  async get({ source, rcno, read, beforeId }: GetNotificationInput) {
    let queryParams = "?";
    for (const param of [source, rcno, read, beforeId]) {
      if (param) queryParams += `${param}&`;
    }
    await this.queryHerald(`notification${queryParams}`, "get");
  }

  async read(input: ReadNotificationInput) {
    await this.queryHerald("notification/read", "post", input);
  }

  async readAll(input: GetNotificationInput) {
    await this.queryHerald("notification/readall", "post", input);
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
