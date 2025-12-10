import { DynamicModule, Global, Module } from "@nestjs/common";
import { NapisModuleAsyncOptions, NapisModuleOptions } from "./napis.interface";
import { NapisService } from "./napis.service";

/**
 * Global module for Napis API integration.
 * Provides NapisService for querying national identity information.
 */
@Global()
@Module({})
export class NapisModule {
  /**
   * Configures the NapisModule with static options.
   *
   * @param {NapisModuleOptions} options - Configuration options
   * @param {string} options.host - Base URL of the Napis API
   * @param {string} [options.appKey] - Optional API key for authentication
   * @returns {DynamicModule} Configured module
   * @example
   * NapisModule.forRoot({
   *   host: 'https://napis.example.com',
   *   appKey: 'your-api-key'
   * })
   */
  public static forRoot(options: NapisModuleOptions): DynamicModule {
    return {
      module: NapisModule,
      providers: [
        {
          provide: NapisService,
          useValue: new NapisService(options),
        },
      ],
      exports: [NapisService],
    };
  }

  /**
   * Configures the NapisModule with async options using factory pattern.
   * Useful when configuration depends on other services or async operations.
   *
   * @param {NapisModuleAsyncOptions} options - Async configuration options
   * @param {any[]} [options.imports] - Modules to import
   * @param {any[]} [options.inject] - Providers to inject into factory
   * @param {Function} [options.useFactory] - Factory function returning config
   * @returns {DynamicModule} Configured module
   * @example
   * NapisModule.forRootAsync({
   *   imports: [ConfigModule],
   *   inject: [ConfigService],
   *   useFactory: async (config: ConfigService) => ({
   *     host: config.get('NAPIS_HOST'),
   *     appKey: config.get('NAPIS_KEY')
   *   })
   * })
   */
  public static forRootAsync(options: NapisModuleAsyncOptions): DynamicModule {
    const providers = [];
    if (options.useFactory) {
      providers.push({
        provide: NapisService,
        useFactory: async (...args: any[]) => {
          const config = await options.useFactory!(...args);
          return new NapisService(config);
        },
        inject: options.inject || [],
      });
    }
    return {
      global: true,
      module: NapisModule,
      imports: options.imports || [],
      providers,
      exports: providers,
    } as DynamicModule;
  }
}
