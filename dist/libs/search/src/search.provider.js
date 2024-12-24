"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsyncOptionsProvider = exports.createAsyncProviders = exports.createConnectionFactory = void 0;
const meilisearch_1 = require("meilisearch");
const constants_1 = require("./constants");
function createConnectionFactory(options) {
    return new meilisearch_1.MeiliSearch(options);
}
exports.createConnectionFactory = createConnectionFactory;
function createAsyncProviders(options) {
    if (options.useExisting || options.useFactory) {
        return [createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass;
    return [
        createAsyncOptionsProvider(options),
        {
            provide: useClass,
            useClass,
        },
    ];
}
exports.createAsyncProviders = createAsyncProviders;
function createAsyncOptionsProvider(options) {
    if (options.useFactory) {
        return {
            provide: constants_1.SEARCH_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject || [],
        };
    }
    return {
        provide: constants_1.SEARCH_MODULE_OPTIONS,
        useFactory: (optionsFactory) => __awaiter(this, void 0, void 0, function* () { return yield optionsFactory.createSearchOptions(); }),
        inject: [
            (options.useClass ||
                options.useExisting),
        ],
    };
}
exports.createAsyncOptionsProvider = createAsyncOptionsProvider;
