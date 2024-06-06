import { DynamicModule, Type } from "@nestjs/common";
import { HeraldService } from "./herald.service";
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
export interface HeraldModuleOptionsFactory {
    createHeraldModuleOptions(): Promise<HeraldConfig> | HeraldConfig;
}
export interface HeraldModuleAsyncOptions {
    name?: string;
    useFactory?: (...args: unknown[]) => HeraldConfig | Promise<HeraldConfig>;
    inject?: Array<string | symbol>;
    imports?: Array<Type<unknown> | DynamicModule>;
}
export declare class HeraldModule {
    static register(config: HeraldConfig): {
        module: typeof HeraldModule;
        providers: {
            provide: typeof HeraldService;
            useValue: HeraldService;
        }[];
        exports: (typeof HeraldService)[];
    };
    static forRootAsync(options: HeraldModuleAsyncOptions): DynamicModule;
}
