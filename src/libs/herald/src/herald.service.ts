import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios, { Method } from "axios";
import { CreateNotificationInput } from "./dto/create-notification.input";
import { HeraldConfig } from "./herald.module";

@Injectable()
export class HeraldService {
  constructor(private config: HeraldConfig) {}
  async queryHerald<T>(
    endpoint: string,
    method: Method = "get",
    body?: any,
    arrayBuffer: boolean = false
  ): Promise<T> {
    const headers = { Authorization: this.config.apiKey };
    const result = await axios
      .request({
        url: `${this.config.baseUrl}/${endpoint}`,
        method,
        headers,
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
        const rcnos = this.config.sendNotification.split(",");
        const allowedRecipients = [];
        for (const i of input.recipients) {
          if (rcnos.includes(`${i.rcno}`)) {
            allowedRecipients.push(i);
          }
        }
        if (allowedRecipients.length === 0) return;
        input.recipients = allowedRecipients;
    }
    if (input.recipients.length === 0) return;
    await this.queryHerald("notification", "post", {
      ...input,
      url: `${this.config.baseUrl}${input.url}`,
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
      url: input.url ? `${this.config.apiKey}${input.url}` : undefined,
      source: this.config.source,
    });
  }
}
