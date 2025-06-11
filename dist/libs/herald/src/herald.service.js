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
var HeraldService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeraldService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let HeraldService = HeraldService_1 = class HeraldService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(HeraldService_1.name);
    }
    queryHerald(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, method = "get", body, arrayBuffer = false) {
            const headers = { Authorization: this.config.heraldApiKey };
            const result = yield axios_1.default
                .request({
                url: `${this.config.heraldApiUrl}/${endpoint}`,
                method,
                headers,
                data: body,
                responseType: arrayBuffer ? "arraybuffer" : undefined,
            })
                .catch((err) => {
                var _a;
                if ((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) {
                    const e = err.response.data;
                    throw new common_1.InternalServerErrorException(`Herald-API: ${e.message}`);
                }
                else {
                    throw new common_1.InternalServerErrorException(err);
                }
            });
            return result.data;
        });
    }
    create(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const source = (_a = input.source) !== null && _a !== void 0 ? _a : this.config.source;
            switch (this.config.sendNotification) {
                case "false":
                    return;
                case undefined:
                case "true":
                case "":
                    break;
                default:
                    const rcnos = this.config.sendNotification.split(",");
                    const allowedRecipients = [];
                    for (const i of input.recipients) {
                        if (rcnos.includes(`${i.rcno}`)) {
                            allowedRecipients.push(i);
                        }
                    }
                    if (allowedRecipients.length === 0)
                        return;
                    input.recipients = allowedRecipients;
            }
            if (input.recipients.length === 0)
                return;
            yield this.queryHerald("notification", "post", Object.assign(Object.assign({}, input), { url: `${(_b = this.config.sourceBaseUrl) !== null && _b !== void 0 ? _b : ""}${(_c = input.url) !== null && _c !== void 0 ? _c : ""}`, source }));
        });
    }
    sendSMS(phone, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.sendNotification === "false")
                return;
            const input = {
                message,
                recipients: [{ phone }],
                source: this.config.source,
            };
            yield this.queryHerald("notification/sms", "post", Object.assign(Object.assign({}, input), { url: input.url ? `${this.config.heraldApiKey}${input.url}` : undefined, source: this.config.source }));
        });
    }
    sendEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, message, emailHtml, emailSubject }) {
            if (this.config.sendNotification === "false")
                return;
            const input = {
                message,
                recipients: [{ email }],
                source: this.config.source,
                emailHtml,
                emailSubject,
            };
            yield this.queryHerald("notification/email", "post", Object.assign(Object.assign({}, input), { url: input.url ? `${this.config.heraldApiKey}${input.url}` : undefined }));
        });
    }
    get(_a) {
        return __awaiter(this, arguments, void 0, function* ({ source, rcno, read, beforeId }) {
            let queryParams = "?";
            for (const param of [source, rcno, read, beforeId]) {
                if (param)
                    queryParams += `${param}&`;
            }
            yield this.queryHerald(`notification${queryParams}`, "get");
        });
    }
    read(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryHerald("notification/read", "post", input);
        });
    }
    readAll(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryHerald("notification/readall", "post", input);
        });
    }
    syncLegacyNotifications(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (inputs.length > 1000) {
                this.logger.warn("Syncing many notifications at once could cause crashes due to lack of memory. It is recommended to sync 1000 or less at a time.");
            }
            const results = yield this.queryHerald("notification/sync", "post", inputs);
            return results;
        });
    }
};
exports.HeraldService = HeraldService;
exports.HeraldService = HeraldService = HeraldService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], HeraldService);
