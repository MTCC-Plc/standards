import { ConsoleLogger } from "@nestjs/common";
/**
 * A custom logger that disables all logs emitted by calling `log` method if
 * they use one of the following contexts:
 * - `InstanceLoader`
 * - `RoutesResolver`
 * - `RouterExplorer`
 * - `NestFactory`
 */
export declare class StandardLogger extends ConsoleLogger {
    static contextsToIgnore: string[];
    log(_: any, context?: string): void;
}
