import { DynamicModule } from "@nestjs/common";
export interface ApsConfig {
    /** Base URL of the APS API including the /api prefix, e.g. https://<host>/api */
    baseUrl: string;
    /** API key for authenticating requests */
    apiKey: string;
}
export interface ApsModuleAsyncOptions {
    imports?: any[];
    inject?: any[];
    useFactory?: (...args: unknown[]) => ApsConfig | Promise<ApsConfig>;
}
export declare class ApsModule {
    static register(config: ApsConfig): DynamicModule;
    static forRootAsync(options: ApsModuleAsyncOptions): DynamicModule;
}
