import { Provider } from "@nestjs/common";
import { SearchModuleAsyncOptions, SearchModuleOptions } from "./search.interface";
export declare function createConnectionFactory(options: SearchModuleOptions): any;
export declare function createAsyncProviders(options: SearchModuleAsyncOptions): Provider[];
export declare function createAsyncOptionsProvider(options: SearchModuleAsyncOptions): Provider;
