import { DynamicModule } from "@nestjs/common";
import { StorageModuleAsyncOptions, StorageModuleOptions } from "./storage.interface";
export declare class StorageModule {
    static forRoot(options: StorageModuleOptions): DynamicModule;
    static forRootAsync(options: StorageModuleAsyncOptions): DynamicModule;
}
