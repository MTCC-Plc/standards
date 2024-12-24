import { ModuleMetadata, Provider, Type } from "@nestjs/common";
import { Config } from "meilisearch";

export interface SearchModuleOptions {
  host: string;
  apiKey?: string;
  headers?: object;
}
export interface SearchModuleOptionsFactory {
  createSearchOptions(): Promise<Config> | Config;
}

export interface SearchModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  useExisting?: Type<SearchModuleOptionsFactory>;
  useClass?: Type<SearchModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<Config> | Config;
  inject?: any[];
  extraProviders?: Provider[];
}
