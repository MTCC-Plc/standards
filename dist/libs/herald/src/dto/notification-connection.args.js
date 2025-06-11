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
exports.NotificationConnectionArgs = void 0;
const graphql_1 = require("@nestjs/graphql");
const pagination_1 = require("../../../../utils/pagination");
let NotificationConnectionArgs = class NotificationConnectionArgs extends pagination_1.default {
};
exports.NotificationConnectionArgs = NotificationConnectionArgs;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], NotificationConnectionArgs.prototype, "rcno", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationConnectionArgs.prototype, "from", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationConnectionArgs.prototype, "to", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NotificationConnectionArgs.prototype, "source", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NotificationConnectionArgs.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NotificationConnectionArgs.prototype, "url", void 0);
exports.NotificationConnectionArgs = NotificationConnectionArgs = __decorate([
    (0, graphql_1.ArgsType)()
], NotificationConnectionArgs);
