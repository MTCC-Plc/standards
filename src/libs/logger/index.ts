import { ConsoleLogger } from "@nestjs/common";

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
export class StandardLogger extends ConsoleLogger {
  static contextsToIgnore = [
    "InstanceLoader",
    "RoutesResolver",
    "RouterExplorer",
    "NestFactory",
  ];

  constructor(additionalContextsToIgnore?: string[]) {
    if (additionalContextsToIgnore) {
      StandardLogger.contextsToIgnore.push(...additionalContextsToIgnore);
    }
    super();
  }

  log(_: any, context?: string): void {
    if (context && !StandardLogger.contextsToIgnore.includes(context)) {
      super.log(this, ...arguments);
    }
  }
}
