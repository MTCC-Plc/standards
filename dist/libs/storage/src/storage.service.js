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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const FormData = require("form-data");
let StorageService = class StorageService {
    constructor(config) {
        this.config = config;
    }
    queryStorage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ endpoint, method, body, headers, responseType = undefined, }) {
            const h = Object.assign({ Authorization: `${this.config.appKey}`, "Content-Type": "application/json" }, headers);
            const result = yield axios_1.default
                .request({
                url: `${this.config.host}/${endpoint}`,
                method,
                headers: h,
                data: body,
                responseType,
            })
                .catch((err) => {
                if (err.response) {
                    const { status, data } = err.response;
                    const errorMessage = (data === null || data === void 0 ? void 0 : data.error) || (data === null || data === void 0 ? void 0 : data.message) || `Storage Service Error`;
                    switch (status) {
                        case 400:
                            throw new common_1.BadRequestException(`Storage Service: ${errorMessage}`);
                        case 401:
                            throw new common_1.UnauthorizedException(`Storage Service: ${errorMessage}`);
                        case 403:
                            throw new common_1.ForbiddenException(`Storage Service: ${errorMessage}`);
                        case 404:
                            throw new common_1.NotFoundException(`Storage Service: ${errorMessage}`);
                        case 500:
                        case 502:
                        case 503:
                        case 504:
                            throw new common_1.InternalServerErrorException(`Storage Service: ${errorMessage}`);
                        default:
                            throw new common_1.HttpException(`Storage Service: ${errorMessage}`, status);
                    }
                }
                else {
                    // Network error or other non-HTTP error
                    throw new common_1.InternalServerErrorException(`Storage Service: ${err.message || "Network error"}`);
                }
            });
            return result;
        });
    }
    /**
     * @param file Express.Multer.File object.
     * @returns the uploaded storage object from the storage service.
     * @description
     * Uploads a file to the storage service. The file should be an
     * Express.Multer.File object.
     */
    upload(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const formData = new FormData();
            formData.append("file", file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
                knownLength: file.size,
            });
            const resp = yield this.queryStorage({
                endpoint: "s",
                method: "post",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return resp.data;
        });
    }
    /**
     * @param id uuid given by the storage service
     * @returns AxiosResponse with the file data.
     * @description
     * Fetches a file from the storage service by its ID. Recommended to use
     * the serve method instead, which is meant to be used with the Res decorator.
     */
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.queryStorage({
                endpoint: `s/${id}`,
                method: "get",
                responseType: "arraybuffer",
            });
            return resp;
        });
    }
    /**
     * @param id uuid given by the storage service
     * @returns AxiosResponse with the file data.
     * @description
     * Runs ocr on the object. Throws an error if the object is not a valid image.
     */
    ocr(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.queryStorage({
                endpoint: `s/${id}/ocr`,
                method: "get",
            });
            return resp.data.text;
        });
    }
    /**
     * @param id uuid given by the storage service
     * @param res response object from express or nestjs given by Res decorator
     *
     * @description
     * Serves a file from the storage service. Meant to be used at the end of the
     * controller method, where you can use the Res decorator.
     */
    serve(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const resp = yield this.queryStorage({
                endpoint: `s/${id}`,
                method: "get",
                responseType: "arraybuffer",
            });
            res.set({
                "Content-Length": (_a = resp.headers["content-length"]) !== null && _a !== void 0 ? _a : "",
                "Content-Disposition": (_b = resp.headers["content-disposition"]) !== null && _b !== void 0 ? _b : "",
                "Content-Type": (_c = resp.headers["content-type"]) !== null && _c !== void 0 ? _c : "application/octet-stream",
                "Cache-Control": (_d = resp.headers["cache-control"]) !== null && _d !== void 0 ? _d : "no-cache",
            });
            res.end(resp.data);
        });
    }
    /**
     * @param id uuid given by the storage service
     *
     * @description
     * Deletes a file from the storage service by its ID.
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryStorage({
                endpoint: `s/${id}`,
                method: "delete",
            });
        });
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], StorageService);
