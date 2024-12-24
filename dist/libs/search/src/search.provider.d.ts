import { Provider } from "@nestjs/common";
import { MeiliSearch } from "meilisearch";
import { SearchModuleAsyncOptions, SearchModuleOptions } from "./search.interface";
export declare function createConnectionFactory(options: SearchModuleOptions): MeiliSearch;
export declare function createAsyncProviders(options: SearchModuleAsyncOptions): Provider[];
export declare function createAsyncOptionsProvider(options: SearchModuleAsyncOptions): Provider;
