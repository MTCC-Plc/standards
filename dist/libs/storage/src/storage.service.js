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
const stream_1 = require("stream");
/** Response headers from the storage service that `serve` passes through. */
const SERVE_PASSTHROUGH_HEADERS = [
    "content-length",
    "content-disposition",
    "content-type",
    "cache-control",
    "accept-ranges",
    "content-range",
    "etag",
];
/**
 * Error bodies arrive as a buffer or stream for non-JSON response types, so
 * they are decoded here to recover the storage service's error message.
 */
function parseErrorData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (data instanceof stream_1.Readable) {
                data = yield new Promise((resolve, reject) => {
                    const chunks = [];
                    data.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
                    data.on("end", () => resolve(Buffer.concat(chunks)));
                    data.on("error", reject);
                });
            }
            if (data instanceof ArrayBuffer) {
                data = Buffer.from(data);
            }
            if (Buffer.isBuffer(data)) {
                data = JSON.parse(data.toString("utf8"));
            }
            return data;
        }
        catch (_a) {
            return undefined;
        }
    });
}
let StorageService = class StorageService {
    constructor(config) {
        this.config = config;
    }
    buildObjectEndpoint(id, options) {
        const params = new URLSearchParams();
        if (options === null || options === void 0 ? void 0 : options.original) {
            params.set("original", "true");
        }
        if (options === null || options === void 0 ? void 0 : options.lossy) {
            params.set("lossy", "true");
        }
        if ((options === null || options === void 0 ? void 0 : options.quality) !== undefined) {
            params.set("quality", `${options.quality}`);
        }
        if ((options === null || options === void 0 ? void 0 : options.width) !== undefined) {
            params.set("width", `${options.width}`);
        }
        if ((options === null || options === void 0 ? void 0 : options.height) !== undefined) {
            params.set("height", `${options.height}`);
        }
        const query = params.toString();
        return query ? `s/${id}?${query}` : `s/${id}`;
    }
    queryStorage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ endpoint, method, body, headers, responseType = undefined, validateStatus = undefined, }) {
            const h = Object.assign({ Authorization: `${this.config.appKey}`, "Content-Type": "application/json" }, headers);
            const result = yield axios_1.default
                .request(Object.assign({ url: `${this.config.host}/${endpoint}`, method, headers: h, data: body, responseType }, (validateStatus ? { validateStatus } : {})))
                .catch((err) => __awaiter(this, void 0, void 0, function* () {
                if (err.response) {
                    const { status } = err.response;
                    const data = yield parseErrorData(err.response.data);
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
            }));
            return result;
        });
    }
    /**
     * @param file Express.Multer.File object.
     * @param options optional OCR options to run during upload.
     * @returns the uploaded storage object from the storage service.
     * @description
     * Uploads a file to the storage service. The file should be an
     * Express.Multer.File object.
     *
     * Supported options:
     * - `ocr: true` runs plain text OCR on the file after upload.
     * - `ocrFields` runs structured field extraction. Pass a map of field names to descriptions.
     *
     * When OCR options are provided, the result is returned in `ocrResult`.
     */
    upload(file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const formData = new FormData();
            formData.append("file", file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
                knownLength: file.size,
            });
            if (options === null || options === void 0 ? void 0 : options.ocrFields) {
                formData.append("ocrFields", JSON.stringify(options.ocrFields));
            }
            else if (options === null || options === void 0 ? void 0 : options.ocr) {
                formData.append("ocr", "true");
            }
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
     * @param options optional transformation controls for image responses
     * @returns AxiosResponse with the file data.
     * @description
     * Fetches a file from the storage service by its ID. Recommended to use
     * the serve method instead, which is meant to be used with the Res decorator.
     *
     * Supported options:
     * - `original: true` serves the original stored object without WebP conversion.
     * - `lossy: true` forces lossy WebP for PNGs, which are otherwise lossless by default.
     * - `quality` sets WebP quality for lossy responses. Default is 80.
     * - `width` and `height` can be added for resizing images. Can only be resized
     *   down, not up. If only one is provided, the other will be auto-scaled to
     *   preserve aspect ratio.
     * - `range` fetches only part of the object, e.g. `bytes=0-1023`. The
     *   response status is 206 when the range is applied.
     */
    fetch(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.queryStorage({
                endpoint: this.buildObjectEndpoint(id, options),
                method: "get",
                responseType: "arraybuffer",
                headers: (options === null || options === void 0 ? void 0 : options.range) ? { Range: options.range } : undefined,
            });
            return resp;
        });
    }
    /**
     * @param id uuid given by the storage service
     * @returns the plain text extracted from the object.
     * @description
     * Runs plain text OCR on the object. Only applicable to images and PDFs.
     * Throws an error if the object is not a supported type. The result is
     * cached on the object, so repeat calls return the stored text.
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
     * @param fields map of field names to descriptions of what to extract
     * @param options optional extraction controls
     * @returns a map of the requested field names to their extracted values.
     * @description
     * Runs structured field extraction on an existing object. Only applicable to
     * images and PDFs. Throws an error if the object is not a supported type.
     *
     * Results are cached per object and field set. Pass `force: true` to bypass
     * the cache and re-run extraction.
     */
    extract(id, fields, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.queryStorage({
                endpoint: `s/${id}/ocr/extract`,
                method: "post",
                body: { fields, force: options === null || options === void 0 ? void 0 : options.force },
            });
            return resp.data;
        });
    }
    /**
     * @param id uuid given by the storage service
     * @param res response object from express or nestjs given by Res decorator
     * @param options optional transformation controls for image responses
     *
     * @description
     * Serves a file from the storage service. Meant to be used at the end of the
     * controller method, where you can use the Res decorator.
     *
     * The file is streamed through without being buffered in memory. The
     * incoming request's Range, If-Range and If-None-Match headers are forwarded,
     * so browsers can stream and seek in video and audio, and HEAD requests are
     * answered without downloading the file.
     *
     * Supported options:
     * - `original: true` serves the original stored object without WebP conversion.
     * - `lossy: true` forces lossy WebP for PNGs, which are otherwise lossless by default.
     * - `quality` sets WebP quality for lossy responses. Default is 80.
     * - `width` and `height` can be added for resizing images. Can only be resized
     *   down, not up. If only one is provided, the other will be auto-scaled to
     *   preserve aspect ratio.
     * - `range` overrides the incoming request's Range header.
     */
    serve(id, res, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            // express exposes the request as res.req
            const req = res.req;
            const incoming = (_a = req === null || req === void 0 ? void 0 : req.headers) !== null && _a !== void 0 ? _a : {};
            const headers = {};
            if (options === null || options === void 0 ? void 0 : options.range) {
                headers.Range = options.range;
            }
            else if (incoming.range) {
                headers.Range = incoming.range;
                if (incoming["if-range"]) {
                    headers["If-Range"] = incoming["if-range"];
                }
            }
            if (incoming["if-none-match"]) {
                headers["If-None-Match"] = incoming["if-none-match"];
            }
            const method = (req === null || req === void 0 ? void 0 : req.method) === "HEAD" ? "head" : "get";
            const resp = yield this.queryStorage({
                endpoint: this.buildObjectEndpoint(id, options),
                method,
                headers,
                responseType: "stream",
                validateStatus: (status) => (status >= 200 && status < 300) || status === 304 || status === 416,
            });
            const outgoing = {};
            for (const name of SERVE_PASSTHROUGH_HEADERS) {
                const value = resp.headers[name];
                if (value !== undefined && value !== null) {
                    outgoing[name] = `${value}`;
                }
            }
            if (resp.status !== 304) {
                (_b = outgoing["content-type"]) !== null && _b !== void 0 ? _b : (outgoing["content-type"] = "application/octet-stream");
                (_c = outgoing["cache-control"]) !== null && _c !== void 0 ? _c : (outgoing["cache-control"] = "no-cache");
            }
            res.status(resp.status);
            res.set(outgoing);
            const body = resp.data;
            if (method === "head" || resp.status === 304) {
                body.destroy();
                res.end();
                return;
            }
            // Resolves once the response finishes or the client disconnects (e.g. a
            // video player seeking); in both cases the upstream request is closed.
            yield new Promise((resolve) => {
                (0, stream_1.pipeline)(body, res, () => resolve());
            });
        });
    }
    /**
     * @param id uuid given by the storage service
     * @param options optional expiry for the URL
     * @returns an unauthenticated URL to the object and when it expires.
     * @description
     * Creates a temporary public URL for an object. The URL needs no app key, so
     * it can be used directly by browsers, e.g. as the src of a video, audio or
     * img element, and supports streaming and seeking. Anyone with the URL can
     * access the object until it expires, so only hand it to users who are
     * allowed to view the object.
     *
     * For Backblaze B2 apps the URL redirects to a pre-signed B2 URL with the
     * same expiry, so the file is downloaded straight from B2. Images converted
     * to WebP, and SharePoint apps, are served by the storage service.
     */
    temporaryUrl(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.queryStorage({
                endpoint: `s/${id}/temp`,
                method: "post",
                body: { expiresInSeconds: options === null || options === void 0 ? void 0 : options.expiresInSeconds },
            });
            return {
                id: resp.data.id,
                url: `${this.config.host}/${resp.data.path}`,
                expiresAt: resp.data.expiresAt,
            };
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
