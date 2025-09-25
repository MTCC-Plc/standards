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
var HeraldModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeraldModule = void 0;
const common_1 = require("@nestjs/common");
const herald_service_1 = require("./herald.service");
let HeraldModule = HeraldModule_1 = class HeraldModule {
    static register(config) {
        return {
            global: true,
            module: HeraldModule_1,
            providers: [
                { provide: herald_service_1.HeraldService, useValue: new herald_service_1.HeraldService(config) },
            ],
            exports: [herald_service_1.HeraldService],
        };
    }
    static forRootAsync(options) {
        const providers = [];
        if (options.useFactory) {
            providers.push({
                provide: herald_service_1.HeraldService,
                useFactory: (...args) => __awaiter(this, void 0, void 0, function* () {
                    if (!options.useFactory) {
                        throw new Error("useFactory is required");
                    }
                    const config = yield options.useFactory(...args);
                    return new herald_service_1.HeraldService(config);
                }),
                inject: options.inject || [],
            });
        }
        return {
            global: true,
            module: HeraldModule_1,
            imports: options.imports || [],
            providers,
            exports: providers,
        };
    }
};
exports.HeraldModule = HeraldModule;
exports.HeraldModule = HeraldModule = HeraldModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [herald_service_1.HeraldService],
        exports: [herald_service_1.HeraldService],
    })
], HeraldModule);
