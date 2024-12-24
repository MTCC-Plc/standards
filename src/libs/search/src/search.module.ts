import { DynamicModule, Global, Module, Provider } from "@nestjs/common";
import { SEARCH_CLIENT, SEARCH_MODULE_OPTIONS } from "./constants";
import {
  SearchModuleAsyncOptions,
  SearchModuleOptions,
} from "./search.interface";
import {
  createAsyncProviders,
  createConnectionFactory,
} from "./search.provider";
import { SearchService } from "./search.service";

@Global()
@Module({})
export class SearchModule {
  public static forRoot(options: SearchModuleOptions): DynamicModule {
    const searchOptions: Provider = {
      provide: SEARCH_MODULE_OPTIONS,
      useValue: options,
    };

    const connectionProvider: Provider = {
      provide: SEARCH_CLIENT,
      useFactory: async () => await createConnectionFactory(options),
    };
    return {
      module: SearchModule,
      providers: [searchOptions, connectionProvider, SearchService],
      exports: [connectionProvider, SearchService],
    };
  }

  public static forRootAsync(options: SearchModuleAsyncOptions): DynamicModule {
    const connectionProvider: Provider = {
      provide: SEARCH_CLIENT,
      useFactory: async (searchOptions: SearchModuleOptions) =>
        await createConnectionFactory(searchOptions),
      inject: [SEARCH_MODULE_OPTIONS],
    };

    const asyncProviders = createAsyncProviders(options);

    return {
      module: SearchModule,
      imports: options.imports || [],
      providers: [...asyncProviders, connectionProvider, SearchService],
      exports: [connectionProvider, SearchService],
    };
  }
}
