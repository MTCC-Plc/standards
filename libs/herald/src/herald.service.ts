import { HttpService } from "@nestjs/axios";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";

/**
 * @baseUrl Base URL of herald API
 * @apiKey API key for herald API
 * @source Source of the notifications to be generated or fetched i.e. the name
 * of the app using this service
 * @sendNotification Meant to be used in development. If false is passed,
 * notifications will not be created. If a list of rcnos are passed, will only
 * create notifications for those employees. In production, this can be either
 * be undefined, empty string or 'true'.
 */
export interface HeraldConfig {
  baseUrl: string;
  apiKey: string;
  source: string;
  sendNotification?: string;
}

export type Method =
  | "get"
  | "GET"
  | "delete"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH"
  | "purge"
  | "PURGE"
  | "link"
  | "LINK"
  | "unlink"
  | "UNLINK";

interface CreateNotificationRecipient {
  rcno?: number;
  email?: string;
  phone?: string;
}

export interface CreateNotificationInput {
  message: string;
  url?: string;
  recipients: CreateNotificationRecipient[];
  scopes?: ("teams" | "email" | "sms")[];
}

@Injectable()
export class HeraldService {
  private readonly logger = new Logger(HeraldService.name);
  constructor(private config: HeraldConfig, private httpService: HttpService) {}

  async queryHerald<T>(
    endpoint: string,
    method: Method = "get",
    body?: any,
    arrayBuffer: boolean = false
  ): Promise<T> {
    const headers = { Authorization: this.config.apiKey };
    const result = await this.httpService.axiosRef
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
      source: this.config.source,
    });
  }

  async sendSMS(phone: string, message: string) {
    if (this.config.sendNotification === "false") return;
    const input: CreateNotificationInput = {
      message,
      recipients: [{ phone }],
    };
    await this.queryHerald("notification/sms", "post", {
      ...input,
      url: input.url ? `${this.config.apiKey}${input.url}` : undefined,
      source: this.config.source,
    });
  }
}
