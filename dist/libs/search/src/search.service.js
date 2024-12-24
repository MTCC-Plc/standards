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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
const meilisearch_1 = require("meilisearch");
const search_decorator_1 = require("./search.decorator");
let SearchService = class SearchService {
    constructor(searchClient) {
        this.searchClient = searchClient;
    }
    search(index, query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.searchClient.index(index).search(query, options);
        });
    }
    addDocuments(index, documents, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.searchClient
                .index(index)
                .addDocuments(documents, options);
        });
    }
    getDocuments(index, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.searchClient.getIndex(index)).getDocuments(parameters);
        });
    }
    updateDocuments(index, documents) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.searchClient.index(index).updateDocuments(documents);
        });
    }
    deleteDocument(index, docId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.searchClient.index(index).deleteDocument(docId);
        });
    }
};
SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, search_decorator_1.InjectSearch)()),
    __metadata("design:paramtypes", [meilisearch_1.MeiliSearch])
], SearchService);
exports.SearchService = SearchService;
