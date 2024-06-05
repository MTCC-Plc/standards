import { Method } from "axios";
import { HeraldConfig } from "./herald.module";
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
    constructor(config: HeraldConfig);
    queryHerald<T>(endpoint: string, method?: Method, body?: any, arrayBuffer?: boolean): Promise<T>;
    create(input: CreateNotificationInput): Promise<void>;
    sendSMS(phone: string, message: string): Promise<void>;
}
export {};
