import { DynamicModule, Global, Module } from "@nestjs/common";
import {
  SearchModuleAsyncOptions,
  SearchModuleOptions,
} from "./search.interface";
import { SearchService } from "./search.service";

@Global()
@Module({})
export class SearchModule {
  public static forRoot(options: SearchModuleOptions): DynamicModule {
    return {
      module: SearchModule,
      providers: [
        {
          provide: SearchService,
          useValue: new SearchService(options),
        },
      ],
      exports: [SearchService],
    };
  }

  public static forRootAsync(options: SearchModuleAsyncOptions): DynamicModule {
    const providers = [];
    if (options.useFactory) {
      providers.push({
        provide: SearchService,
        useFactory: options.useFactory,
      });
    }
    return {
      global: true,
      module: SearchModule,
      providers,
      exports: providers,
    } as DynamicModule;
  }
}
