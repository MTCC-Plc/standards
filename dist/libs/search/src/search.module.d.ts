import { DynamicModule } from "@nestjs/common";
import { SearchModuleAsyncOptions, SearchModuleOptions } from "./search.interface";
export declare class SearchModule {
    static forRoot(options: SearchModuleOptions): DynamicModule;
    static forRootAsync(options: SearchModuleAsyncOptions): DynamicModule;
}
