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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRecipientScope = exports.NotificationRecipientInput = exports.CreateNotificationInput = void 0;
const class_validator_1 = require("class-validator");
const constants_1 = require("../constants");
class CreateNotificationInput {
    constructor() {
        this.scopes = [];
        this.sendAllScopes = false;
        this.ignoreLimit = false;
    }
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", Array)
], CreateNotificationInput.prototype, "recipients", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "emailHtml", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "emailSubject", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)(constants_1.NOTIFICATION_SCOPE_NAMES, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateNotificationInput.prototype, "scopes", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateNotificationInput.prototype, "sendAllScopes", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateNotificationInput.prototype, "ignoreLimit", void 0);
exports.CreateNotificationInput = CreateNotificationInput;
class NotificationRecipientInput {
    constructor() {
        this.flaggedForFetch = false;
    }
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], NotificationRecipientInput.prototype, "rcno", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], NotificationRecipientInput.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], NotificationRecipientInput.prototype, "phone", void 0);
exports.NotificationRecipientInput = NotificationRecipientInput;
class NotificationRecipientScope {
}
exports.NotificationRecipientScope = NotificationRecipientScope;
