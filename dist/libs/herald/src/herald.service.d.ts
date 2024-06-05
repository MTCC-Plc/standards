import { HttpService } from "@nestjs/axios";
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
export type Method = "get" | "GET" | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "purge" | "PURGE" | "link" | "LINK" | "unlink" | "UNLINK";
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
export declare class HeraldService {
    private config;
    private httpService;
    private readonly logger;
    constructor(config: HeraldConfig, httpService: HttpService);
    queryHerald<T>(endpoint: string, method?: Method, body?: any, arrayBuffer?: boolean): Promise<T>;
    create(input: CreateNotificationInput): Promise<void>;
    sendSMS(phone: string, message: string): Promise<void>;
}
export {};
