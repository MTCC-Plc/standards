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
const constants_1 = require("./constants");
const FormData = require("form-data");
let HeraldService = HeraldService_1 = class HeraldService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(HeraldService_1.name);
    }
    queryHerald(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, method = "get", body, arrayBuffer = false, headers) {
            const requestHeaders = Object.assign({ Authorization: this.config.heraldApiKey }, headers);
            const result = yield axios_1.default
                .request({
                url: `${this.config.heraldApiUrl}/${endpoint}`,
                method,
                headers: requestHeaders,
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
    /**
     * Filters recipients against the `sendNotification` config allowlist.
     * Returns the recipients allowed to receive notifications, or `null` when
     * notifications should not be sent at all.
     */
    filterRecipients(recipients) {
        switch (this.config.sendNotification) {
            case "false":
                return null;
            case undefined:
            case "true":
            case "":
                return recipients;
            default:
                const identifiers = this.config.sendNotification.split(",");
                const allowedRecipients = recipients.filter((i) => identifiers.includes(`${i.rcno}`) ||
                    identifiers.includes(`${i.email}`) ||
                    identifiers.includes(`${i.phone}`));
                return allowedRecipients.length === 0 ? null : allowedRecipients;
        }
    }
    /**
     * Prefixes a source relative url with the configured `sourceBaseUrl`.
     * Returns undefined when no url is given, so that the notification is stored
     * without a url instead of pointing at the bare base url.
     */
    buildUrl(url) {
        var _a;
        if (!url)
            return undefined;
        return `${(_a = this.config.sourceBaseUrl) !== null && _a !== void 0 ? _a : ""}${url}`;
    }
    create(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const source = (_a = input.source) !== null && _a !== void 0 ? _a : this.config.source;
            const recipients = this.filterRecipients(input.recipients);
            if (!recipients || recipients.length === 0)
                return;
            input.recipients = recipients;
            yield this.queryHerald("notification", "post", Object.assign(Object.assign({}, input), { url: this.buildUrl(input.url), source }));
        });
    }
    sendSMS(phone, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const recipients = this.filterRecipients([{ phone }]);
            if (!recipients)
                return;
            yield this.queryHerald("notification/sms", "post", {
                message,
                recipients,
                source: this.config.source,
            });
        });
    }
    sendEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, message, url, emailHtml, emailSubject, }) {
            const recipients = this.filterRecipients([{ email }]);
            if (!recipients)
                return;
            yield this.queryHerald("notification/email", "post", {
                message,
                recipients,
                source: this.config.source,
                url: this.buildUrl(url),
                emailHtml,
                emailSubject,
            });
        });
    }
    sendEmailWithAttachments(_a) {
        return __awaiter(this, arguments, void 0, function* ({ recipients, message, source, url, emailHtml, emailSubject, attachments, }) {
            const filteredRecipients = this.filterRecipients(recipients);
            if (!filteredRecipients)
                return;
            if (attachments.length > constants_1.MAX_EMAIL_ATTACHMENT_COUNT) {
                throw new common_1.BadRequestException(`A maximum of ${constants_1.MAX_EMAIL_ATTACHMENT_COUNT} attachments can be sent at a time.`);
            }
            for (const attachment of attachments) {
                if (attachment.content.length > constants_1.MAX_EMAIL_ATTACHMENT_SIZE) {
                    throw new common_1.BadRequestException(`Attachment ${attachment.filename} exceeds the maximum size of ${constants_1.MAX_EMAIL_ATTACHMENT_SIZE / (1024 * 1024)} MB.`);
                }
            }
            const formData = new FormData();
            formData.append("message", message);
            formData.append("recipients", JSON.stringify(filteredRecipients));
            formData.append("source", source !== null && source !== void 0 ? source : this.config.source);
            const notificationUrl = this.buildUrl(url);
            if (notificationUrl) {
                formData.append("url", notificationUrl);
            }
            if (emailHtml) {
                formData.append("emailHtml", emailHtml);
            }
            if (emailSubject) {
                formData.append("emailSubject", emailSubject);
            }
            for (const attachment of attachments) {
                formData.append("attachments", attachment.content, {
                    filename: attachment.filename,
                    contentType: attachment.contentType,
                });
            }
            yield this.queryHerald("notification/email-with-attachments", "post", formData, false, formData.getHeaders());
        });
    }
    get(_a) {
        return __awaiter(this, arguments, void 0, function* ({ source, rcno, email, phone, read, beforeId, }) {
            const params = {
                source: source !== null && source !== void 0 ? source : this.config.source,
                rcno,
                email,
                phone,
                read,
                beforeId,
            };
            const queryParams = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                if (value === undefined || value === null || value === "")
                    continue;
                queryParams.append(key, `${value}`);
            }
            return yield this.queryHerald(`notification?${queryParams.toString()}`, "get");
        });
    }
    read(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryHerald("notification/read", "post", input);
        });
    }
    readAll(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this.queryHerald("notification/readall", "post", Object.assign(Object.assign({}, input), { source: (_a = input.source) !== null && _a !== void 0 ? _a : this.config.source }));
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
