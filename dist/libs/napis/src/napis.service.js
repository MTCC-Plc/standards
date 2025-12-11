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
exports.NapisService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
/**
 * Service for interacting with the Napis API.
 * Provides methods to query national identity information from various government services.
 */
let NapisService = class NapisService {
    constructor(config) {
        this.config = config;
    }
    /**
     * Makes a custom query to the Napis API.
     * Handles authentication and error transformation into NestJS HTTP exceptions.
     *
     * @template T - The expected response type
     * @param {QueryNapisInput} options - Query configuration options
     * @param {string} options.endpoint - The API endpoint to call (relative to host)
     * @param {string} [options.method='get'] - HTTP method to use
     * @param {any} [options.body] - Request body for POST/PUT requests
     * @param {Record<string, string>} [options.headers] - Additional headers to include
     * @param {"json" | "arraybuffer" | "text"} [options.responseType] - Expected response type
     * @returns {Promise<AxiosResponse<T, any>>} Axios response with the requested data
     * @throws {BadRequestException} When the API returns a 400 status
     * @throws {UnauthorizedException} When the API returns a 401 status
     * @throws {ForbiddenException} When the API returns a 403 status
     * @throws {NotFoundException} When the API returns a 404 status
     * @throws {InternalServerErrorException} When the API returns 5xx status or network errors occur
     * @throws {HttpException} For other HTTP error statuses
     */
    queryNapis(_a) {
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
                    const errorMessage = (data === null || data === void 0 ? void 0 : data.error) || (data === null || data === void 0 ? void 0 : data.message) || `Napis Error`;
                    switch (status) {
                        case 400:
                            throw new common_1.BadRequestException(`Napis: ${errorMessage}`);
                        case 401:
                            throw new common_1.UnauthorizedException(`Napis: ${errorMessage}`);
                        case 403:
                            throw new common_1.ForbiddenException(`Napis: ${errorMessage}`);
                        case 404:
                            throw new common_1.NotFoundException(`Napis: ${errorMessage}`);
                        case 500:
                        case 502:
                        case 503:
                        case 504:
                            throw new common_1.InternalServerErrorException(`Napis: ${errorMessage}`);
                        default:
                            throw new common_1.HttpException(`Napis: ${errorMessage}`, status);
                    }
                }
                else {
                    // Network error or other non-HTTP error
                    throw new common_1.InternalServerErrorException(`Napis: ${err.message || "Network error"}`);
                }
            });
            return result;
        });
    }
    /**
     * Checks if a person is registered as a Person with Disability (PWD) with NSPA.
     *
     * @param {string} nid - National ID number to check
     * @returns {Promise<IsPwdResponse>} Object containing isPwd status and optional disability type
     * @example
     * const result = await napisService.isPwd('A123456');
     * if (result.isPwd) {
     *   console.log(`PWD Type: ${result.type}`);
     * }
     */
    isPwd(nid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.mock) {
                const lastNumber = parseInt(nid.slice(-1), 10);
                if (lastNumber && lastNumber % 2 === 0) {
                    return {
                        isPwd: true,
                        type: "Visual Impairment",
                    };
                }
                return {
                    isPwd: false,
                };
            }
            const resp = yield this.queryNapis({
                endpoint: `nspa/pwd?nid=${nid}`,
                method: "get",
            });
            return resp.data;
        });
    }
    /**
     * Validates identity information against the DNR (Department of National Registration) database.
     * Checks if the provided information matches the official records.
     *
     * @param {ValidInfoInput} input - Identity information to validate
     * @param {string} input.nid - National ID number (required)
     * @param {string} [input.name] - Full name to validate
     * @param {string} [input.dob] - Date of birth to validate (format: YYYY-MM-DD)
     * @param {string} [input.atoll] - Atoll name to validate
     * @param {string} [input.island] - Island name to validate
     * @param {string} [input.home] - Home name/address to validate
     * @returns {Promise<IsValidResponse>} Validation result with isValid status, errors array, and dob if available
     * @example
     * const result = await napisService.isValid({
     *   nid: 'A123456',
     *   name: 'John Doe',
     *   dob: '1990-01-01'
     * });
     * if (!result.isValid) {
     *   console.log('Validation errors:', result.errors);
     * }
     */
    isValid(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = new URLSearchParams();
            params.append("nid", input.nid);
            if (input.name)
                params.append("name", input.name);
            if (input.dob)
                params.append("dob", input.dob);
            if (input.atoll)
                params.append("atoll", input.atoll);
            if (input.island)
                params.append("island", input.island);
            if (input.home)
                params.append("home", input.home);
            const resp = yield this.queryNapis({
                endpoint: `dnr/valid?${params.toString()}`,
                method: "get",
            });
            return resp.data;
        });
    }
    /**
     * Checks if a person is over 18 years old based on their National ID.
     * Uses DNR data to determine age.
     *
     * @param {string} nid - National ID number to check
     * @returns {Promise<boolean>} True if the person is over 18, false otherwise
     * @example
     * const isAdult = await napisService.isOver18('A123456');
     * if (!isAdult) {
     *   throw new ForbiddenException('Must be 18 or older');
     * }
     */
    isOver18(nid) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.queryNapis({
                endpoint: `dnr/over18?nid=${nid}`,
                method: "get",
            });
            return resp.data;
        });
    }
    /**
     * Retrieves basic identity information from the DNR database.
     *
     * @param {string} nid - National ID number
     * @returns {Promise<GetBasicResponse>} Basic information including name, dob, atoll, island, and home
     * @example
     * const info = await napisService.getBasic('A123456');
     * console.log(`Name: ${info.name}, DOB: ${info.dob}`);
     * console.log(`Address: ${info.home}, ${info.island}, ${info.atoll}`);
     */
    getBasic(nid) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.queryNapis({
                endpoint: `dnr/basic?nid=${nid}`,
                method: "get",
            });
            return resp.data;
        });
    }
};
exports.NapisService = NapisService;
exports.NapisService = NapisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], NapisService);
