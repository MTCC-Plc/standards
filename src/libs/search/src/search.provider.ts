import { Provider, Type } from "@nestjs/common";
import { MeiliSearch } from "meilisearch";
import { SEARCH_MODULE_OPTIONS } from "./constants";
import {
  SearchModuleAsyncOptions,
  SearchModuleOptions,
  SearchModuleOptionsFactory,
} from "./search.interface";

export function createConnectionFactory(options: SearchModuleOptions) {
  return new MeiliSearch(options);
}

export function createAsyncProviders(
  options: SearchModuleAsyncOptions
): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [createAsyncOptionsProvider(options)];
  }
  const useClass = options.useClass as Type<SearchModuleOptionsFactory>;
  return [
    createAsyncOptionsProvider(options),
    {
      provide: useClass,
      useClass,
    },
  ];
}

export function createAsyncOptionsProvider(
  options: SearchModuleAsyncOptions
): Provider {
  if (options.useFactory) {
    return {
      provide: SEARCH_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
  return {
    provide: SEARCH_MODULE_OPTIONS,
    useFactory: async (optionsFactory: SearchModuleOptionsFactory) =>
      await optionsFactory.createSearchOptions(),
    inject: [
      (options.useClass ||
        options.useExisting) as Type<SearchModuleOptionsFactory>,
    ],
  };
}
