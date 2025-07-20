import { DynamicModule, Global, Module } from "@nestjs/common";
import {
  StorageModuleAsyncOptions,
  StorageModuleOptions,
} from "./storage.interface";
import { StorageService } from "./storage.service";

@Global()
@Module({})
export class StorageModule {
  public static forRoot(options: StorageModuleOptions): DynamicModule {
    return {
      module: StorageModule,
      providers: [
        {
          provide: StorageService,
          useValue: new StorageService(options),
        },
      ],
      exports: [StorageService],
    };
  }

  public static forRootAsync(
    options: StorageModuleAsyncOptions
  ): DynamicModule {
    const providers = [];
    if (options.useFactory) {
      providers.push({
        provide: StorageService,
        useFactory: async (...args: any[]) => {
          const config = await options.useFactory!(...args);
          return new StorageService(config);
        },
        inject: options.inject || [],
      });
    }
    return {
      global: true,
      module: StorageModule,
      imports: options.imports || [],
      providers,
      exports: providers,
    } as DynamicModule;
  }
}
