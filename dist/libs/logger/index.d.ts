import { ConsoleLogger } from "@nestjs/common";
interface StandardLoggerConfig {
    additionalContextsToIgnore?: string[];
}
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
export declare class StandardLogger extends ConsoleLogger {
    static contextsToIgnore: string[];
    constructor(config?: StandardLoggerConfig);
    log(_: any, context?: string): void;
}
export {};
