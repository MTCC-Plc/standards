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
var ApsModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApsModule = void 0;
const common_1 = require("@nestjs/common");
const aps_service_1 = require("./aps.service");
let ApsModule = ApsModule_1 = class ApsModule {
    static register(config) {
        return {
            global: true,
            module: ApsModule_1,
            providers: [{ provide: aps_service_1.ApsService, useValue: new aps_service_1.ApsService(config) }],
            exports: [aps_service_1.ApsService],
        };
    }
    static forRootAsync(options) {
        const providers = [];
        if (options.useFactory) {
            providers.push({
                provide: aps_service_1.ApsService,
                useFactory: (...args) => __awaiter(this, void 0, void 0, function* () {
                    if (!options.useFactory) {
                        throw new Error("useFactory is required");
                    }
                    const config = yield options.useFactory(...args);
                    return new aps_service_1.ApsService(config);
                }),
                inject: options.inject || [],
            });
        }
        return {
            global: true,
            module: ApsModule_1,
            imports: options.imports || [],
            providers,
            exports: providers,
        };
    }
};
exports.ApsModule = ApsModule;
exports.ApsModule = ApsModule = ApsModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [aps_service_1.ApsService],
        exports: [aps_service_1.ApsService],
    })
], ApsModule);
