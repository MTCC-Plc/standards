"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HeraldModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeraldModule = void 0;
const common_1 = require("@nestjs/common");
const herald_service_1 = require("./herald.service");
const HERALD_CONFIG = "HeraldConfig";
const HERALD_MODULE_SERVICE = "HeraldModuleService";
const createHeraldAsyncProviders = (options) => {
    var _a;
    const providers = [
        {
            provide: HERALD_MODULE_SERVICE,
            useFactory: (config) => new herald_service_1.HeraldService(config),
            inject: [HERALD_CONFIG],
        },
    ];
    const { useFactory } = options;
    if (useFactory) {
        providers.push({
            provide: HERALD_CONFIG,
            useFactory,
            inject: (_a = options.inject) !== null && _a !== void 0 ? _a : [],
        });
    }
    return providers;
};
let HeraldModule = HeraldModule_1 = class HeraldModule {
    static register(config) {
        return {
            module: HeraldModule_1,
            providers: [
                { provide: herald_service_1.HeraldService, useValue: new herald_service_1.HeraldService(config) },
            ],
            exports: [herald_service_1.HeraldService],
        };
    }
    static forRootAsync(options) {
        const providers = createHeraldAsyncProviders(options);
        return {
            module: HeraldModule_1,
            providers,
            exports: providers,
            imports: options.imports,
        };
    }
};
HeraldModule = HeraldModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [herald_service_1.HeraldService],
        exports: [herald_service_1.HeraldService],
    })
], HeraldModule);
exports.HeraldModule = HeraldModule;
