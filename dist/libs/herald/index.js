/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(1), exports);
__exportStar(__webpack_require__(3), exports);


/***/ }),
/* 1 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HeraldModule = void 0;
const common_1 = __webpack_require__(2);
const herald_service_1 = __webpack_require__(3);
let HeraldModule = class HeraldModule {
};
HeraldModule = __decorate([
    (0, common_1.Module)({
        providers: [herald_service_1.HeraldService],
        exports: [herald_service_1.HeraldService],
    })
], HeraldModule);
exports.HeraldModule = HeraldModule;


/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HeraldService = void 0;
const axios_1 = __webpack_require__(4);
const common_1 = __webpack_require__(2);
let HeraldService = HeraldService_1 = class HeraldService {
    constructor(config, httpService) {
        this.config = config;
        this.httpService = httpService;
        this.logger = new common_1.Logger(HeraldService_1.name);
    }
    queryHerald(endpoint, method = "get", body, arrayBuffer = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = { Authorization: this.config.apiKey };
            const result = yield this.httpService.axiosRef
                .request({
                url: `${this.config.baseUrl}/${endpoint}`,
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
            yield this.queryHerald("notification", "post", Object.assign(Object.assign({}, input), { url: `${this.config.baseUrl}${input.url}`, source: this.config.source }));
        });
    }
    sendSMS(phone, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.sendNotification === "false")
                return;
            const input = {
                message,
                recipients: [{ phone }],
            };
            yield this.queryHerald("notification/sms", "post", Object.assign(Object.assign({}, input), { url: input.url ? `${this.config.apiKey}${input.url}` : undefined, source: this.config.source }));
        });
    }
};
HeraldService = HeraldService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], HeraldService);
exports.HeraldService = HeraldService;


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ })()
;