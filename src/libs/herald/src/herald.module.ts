import { DynamicModule, Module } from "@nestjs/common";
import { HeraldService } from "./herald.service";

/**
 * @heraldApiUrl URL of herald API
 * @heraldApiKey API key for herald API
 * @source Source of the notifications to be generated or fetched i.e. the name
 * of the app using this service
 * @sourceBaseUrl Base url of the source frontend
 * @sendNotification Meant to be used in development. If false is passed,
 * notifications will not be created. If a list of rcnos are passed, will only
 * create notifications for those employees. In production, this can be either
 * be undefined, empty string or 'true'.
 */
export interface HeraldConfig {
  heraldApiUrl: string;
  heraldApiKey: string;
  source: string;
  sourceBaseUrl: string;
  sendNotification?: string;
}

export interface HeraldModuleAsyncOptions {
  useFactory?: (...args: unknown[]) => HeraldConfig | Promise<HeraldConfig>;
}

@Module({
  providers: [HeraldService],
  exports: [HeraldService],
})
export class HeraldModule {
  static register(config: HeraldConfig) {
    return {
      global: true,
      module: HeraldModule,
      providers: [
        { provide: HeraldService, useValue: new HeraldService(config) },
      ],
      exports: [HeraldService],
    };
  }
  static forRootAsync(options: HeraldModuleAsyncOptions): DynamicModule {
    const providers = [];
    if (options.useFactory) {
      providers.push({
        provide: HeraldService,
        useFactory: options.useFactory,
      });
    }
    return {
      global: true,
      module: HeraldModule,
      providers,
      exports: providers,
    } as DynamicModule;
  }
}
