"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardLogger = void 0;
const common_1 = require("@nestjs/common");
/**
 * A custom logger that disables all logs emitted by calling `log` method if
 * they use one of the following contexts:
 * - `InstanceLoader`
 * - `RoutesResolver`
 * - `RouterExplorer`
 * - `NestFactory`
 */
class StandardLogger extends common_1.ConsoleLogger {
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
