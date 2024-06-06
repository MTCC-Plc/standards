import { Method } from "axios";
import { GetNotificationInput, ReadNotificationInput, SyncNotificationInput } from "./dto";
import { CreateNotificationInput } from "./dto/create-notification.input";
import { HeraldConfig } from "./herald.module";
export declare class HeraldService {
    private config;
    private logger;
    constructor(config: HeraldConfig);
    queryHerald<T>(endpoint: string, method?: Method, body?: any, arrayBuffer?: boolean): Promise<T>;
    create(input: CreateNotificationInput): Promise<void>;
    sendSMS(phone: string, message: string): Promise<void>;
    sendEmail(email: string, message: string): Promise<void>;
    get({ source, rcno, read, beforeId }: GetNotificationInput): Promise<void>;
    read(input: ReadNotificationInput): Promise<void>;
    readAll(input: GetNotificationInput): Promise<void>;
    syncLegacyNotifications(inputs: SyncNotificationInput[]): Promise<SyncNotificationInput[]>;
}
