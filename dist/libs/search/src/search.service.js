"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let SearchService = class SearchService {
    constructor(searchConfig) {
        this.searchConfig = searchConfig;
    }
    queryMeili(endpoint, method = "get", body) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                Authorization: `Bearer ${this.searchConfig.apiKey}`,
                "Content-Type": "application/json",
            };
            const result = yield axios_1.default
                .request({
                url: `${this.searchConfig.host}/${endpoint}`,
                method,
                headers,
                data: body,
            })
                .catch((err) => {
                var _a;
                if ((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) {
                    const e = err.response.data;
                    throw new Error(`MeiliSearch-API: ${e.message}`);
                }
                else {
                    throw new Error(err);
                }
            });
            return result.data;
        });
    }
    search(index, query, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.queryMeili(`indexes/${index}/search?q=${query}${filter ? `&filter=${filter}` : ""}`, "get");
            return res;
        });
    }
    deleteAll(index) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryMeili(`indexes/${index}/documents`, "delete");
        });
    }
    addDocuments(index, documents) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryMeili(`indexes/${index}/documents`, "put", documents);
        });
    }
};
SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], SearchService);
exports.SearchService = SearchService;
