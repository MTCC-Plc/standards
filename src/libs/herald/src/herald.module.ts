import { DynamicModule, Module, Provider, Type } from "@nestjs/common";
import { HeraldService } from "./herald.service";

/**
 * @baseUrl Base URL of herald API
 * @apiKey API key for herald API
 * @source Source of the notifications to be generated or fetched i.e. the name
 * of the app using this service
 * @sendNotification Meant to be used in development. If false is passed,
 * notifications will not be created. If a list of rcnos are passed, will only
 * create notifications for those employees. In production, this can be either
 * be undefined, empty string or 'true'.
 */
export interface HeraldConfig {
  baseUrl: string;
  apiKey: string;
  source: string;
  sendNotification?: string;
}

export interface HeraldModuleOptionsFactory {
  createHeraldModuleOptions(): Promise<HeraldConfig> | HeraldConfig;
}

export interface HeraldModuleAsyncOptions {
  name?: string;
  useFactory?: (...args: unknown[]) => HeraldConfig | Promise<HeraldConfig>;
  inject?: Array<string | symbol>;
  imports?: Array<Type<unknown> | DynamicModule>;
}

const HERALD_CONFIG = "HeraldConfig";
const HERALD_MODULE_SERVICE = "HeraldModuleService";

const createHeraldAsyncProviders = (
  options: HeraldModuleAsyncOptions
): Provider[] => {
  const providers: Provider[] = [
    {
      provide: HERALD_MODULE_SERVICE,
      useFactory: (config: HeraldConfig) => new HeraldService(config),
      inject: [HERALD_CONFIG],
    },
  ];
  const { useFactory } = options;
  if (useFactory) {
    providers.push({
      provide: HERALD_CONFIG,
      useFactory,
      inject: options.inject ?? [],
    });
  }
  return providers;
};

@Module({
  providers: [HeraldService],
  exports: [HeraldService],
})
export class HeraldModule {
  static register(config: HeraldConfig) {
    return {
      module: HeraldModule,
      providers: [
        { provide: HeraldService, useValue: new HeraldService(config) },
      ],
      exports: [HeraldService],
    };
  }
  static forRootAsync(options: HeraldModuleAsyncOptions): DynamicModule {
    const providers = createHeraldAsyncProviders(options);
    return {
      module: HeraldModule,
      providers,
      exports: providers,
      imports: options.imports,
    } as DynamicModule;
  }
}
