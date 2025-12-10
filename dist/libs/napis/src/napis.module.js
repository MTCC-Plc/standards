"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var NapisModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NapisModule = void 0;
const common_1 = require("@nestjs/common");
const napis_service_1 = require("./napis.service");
/**
 * Global module for Napis API integration.
 * Provides NapisService for querying national identity information.
 */
let NapisModule = NapisModule_1 = class NapisModule {
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
    static forRoot(options) {
        return {
            module: NapisModule_1,
            providers: [
                {
                    provide: napis_service_1.NapisService,
                    useValue: new napis_service_1.NapisService(options),
                },
            ],
            exports: [napis_service_1.NapisService],
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
    static forRootAsync(options) {
        const providers = [];
        if (options.useFactory) {
            providers.push({
                provide: napis_service_1.NapisService,
                useFactory: (...args) => __awaiter(this, void 0, void 0, function* () {
                    const config = yield options.useFactory(...args);
                    return new napis_service_1.NapisService(config);
                }),
                inject: options.inject || [],
            });
        }
        return {
            global: true,
            module: NapisModule_1,
            imports: options.imports || [],
            providers,
            exports: providers,
        };
    }
};
exports.NapisModule = NapisModule;
exports.NapisModule = NapisModule = NapisModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], NapisModule);
