import { Method } from "axios";
import { CreateNotificationInput } from "./dto/create-notification.input";
import { HeraldConfig } from "./herald.module";
export declare class HeraldService {
    private config;
    constructor(config: HeraldConfig);
    queryHerald<T>(endpoint: string, method?: Method, body?: any, arrayBuffer?: boolean): Promise<T>;
    create(input: CreateNotificationInput): Promise<void>;
    sendSMS(phone: string, message: string): Promise<void>;
}
