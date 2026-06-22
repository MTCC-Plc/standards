import { DynamicModule, Module } from "@nestjs/common";
import { ApsService } from "./aps.service";

export interface ApsConfig {
  /** Base URL of the APS API including the /api prefix, e.g. https://<host>/api */
  baseUrl: string;
  /** API key for authenticating requests */
  apiKey: string;
}

export interface ApsModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory?: (...args: unknown[]) => ApsConfig | Promise<ApsConfig>;
}

@Module({
  providers: [ApsService],
  exports: [ApsService],
})
export class ApsModule {
  static register(config: ApsConfig): DynamicModule {
    return {
      global: true,
      module: ApsModule,
      providers: [{ provide: ApsService, useValue: new ApsService(config) }],
      exports: [ApsService],
    };
  }

  static forRootAsync(options: ApsModuleAsyncOptions): DynamicModule {
    const providers = [];
    if (options.useFactory) {
      providers.push({
        provide: ApsService,
        useFactory: async (...args: unknown[]) => {
          if (!options.useFactory) {
            throw new Error("useFactory is required");
          }
          const config = await options.useFactory(...args);
          return new ApsService(config);
        },
        inject: options.inject || [],
      });
    }
    return {
      global: true,
      module: ApsModule,
      imports: options.imports || [],
      providers,
      exports: providers,
    } as DynamicModule;
  }
}
