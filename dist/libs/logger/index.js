"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardLogger = void 0;
const common_1 = require("@nestjs/common");
/**
 * A custom logger that disables all logs emitted by calling `log` method.
 * By default ignores the following contexts:
 * - `InstanceLoader`
 * - `RoutesResolver`
 * - `RouterExplorer`
 * - `NestFactory`
 *
 * To ignore additional contexts, pass them as an array to the constructor.
 */
class StandardLogger extends common_1.ConsoleLogger {
    constructor(config) {
        if (config === null || config === void 0 ? void 0 : config.additionalContextsToIgnore) {
            StandardLogger.contextsToIgnore.push(...config.additionalContextsToIgnore);
        }
        super();
    }
    log(_, context) {
        if (context && !StandardLogger.contextsToIgnore.includes(context)) {
            super.log(this, ...arguments);
        }
    }
}
exports.StandardLogger = StandardLogger;
StandardLogger.contextsToIgnore = [
    "InstanceLoader",
    "RoutesResolver",
    "RouterExplorer",
    "NestFactory",
];
