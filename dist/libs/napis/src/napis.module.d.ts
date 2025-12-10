import { DynamicModule } from "@nestjs/common";
import { NapisModuleAsyncOptions, NapisModuleOptions } from "./napis.interface";
/**
 * Global module for Napis API integration.
 * Provides NapisService for querying national identity information.
 */
export declare class NapisModule {
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
    static forRoot(options: NapisModuleOptions): DynamicModule;
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
    static forRootAsync(options: NapisModuleAsyncOptions): DynamicModule;
}
