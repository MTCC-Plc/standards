import NoCountConnectionArgs from "../../../../utils/pagination";
export declare class NotificationConnectionArgs extends NoCountConnectionArgs {
    rcno?: number;
    from?: Date;
    to?: Date;
    source?: string;
    message?: string;
    url?: string;
}
