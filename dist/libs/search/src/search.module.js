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
var SearchModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
const search_provider_1 = require("./search.provider");
const search_service_1 = require("./search.service");
let SearchModule = SearchModule_1 = class SearchModule {
    static forRoot(options) {
        const searchOptions = {
            provide: constants_1.SEARCH_MODULE_OPTIONS,
            useValue: options,
        };
        const connectionProvider = {
            provide: constants_1.SEARCH_CLIENT,
            useFactory: () => __awaiter(this, void 0, void 0, function* () { return yield (0, search_provider_1.createConnectionFactory)(options); }),
        };
        return {
            module: SearchModule_1,
            providers: [searchOptions, connectionProvider, search_service_1.SearchService],
            exports: [connectionProvider, search_service_1.SearchService],
        };
    }
    static forRootAsync(options) {
        const connectionProvider = {
            provide: constants_1.SEARCH_CLIENT,
            useFactory: (searchOptions) => __awaiter(this, void 0, void 0, function* () { return yield (0, search_provider_1.createConnectionFactory)(searchOptions); }),
            inject: [constants_1.SEARCH_MODULE_OPTIONS],
        };
        const asyncProviders = (0, search_provider_1.createAsyncProviders)(options);
        return {
            module: SearchModule_1,
            imports: options.imports || [],
            providers: [...asyncProviders, connectionProvider, search_service_1.SearchService],
            exports: [connectionProvider, search_service_1.SearchService],
        };
    }
};
SearchModule = SearchModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], SearchModule);
exports.SearchModule = SearchModule;
