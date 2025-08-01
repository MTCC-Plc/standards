"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SearchModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const search_service_1 = require("./search.service");
let SearchModule = SearchModule_1 = class SearchModule {
    static forRoot(options) {
        return {
            module: SearchModule_1,
            providers: [
                {
                    provide: search_service_1.SearchService,
                    useValue: new search_service_1.SearchService(options),
                },
            ],
            exports: [search_service_1.SearchService],
        };
    }
    static forRootAsync(options) {
        const providers = [];
        if (options.useFactory) {
            providers.push({
                provide: search_service_1.SearchService,
                useFactory: options.useFactory,
            });
        }
        return {
            global: true,
            module: SearchModule_1,
            providers,
            exports: providers,
        };
    }
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = SearchModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], SearchModule);
