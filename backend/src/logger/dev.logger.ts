import { Injectable, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class DevLogger extends ConsoleLogger {
  constructor(context?: string) {
    super(context);
  }

  error(message: any, trace?: string, context?: string) {
    super.error(`[ERROR] ${message}`, trace, context);
  }

  warn(message: any, context?: string) {
    super.warn(`[WARN] ${message}`, context);
  }

  debug(message: any, context?: string) {
    super.debug(`[DEBUG] ${message}`, context);
  }

  verbose(message: any, context?: string) {
    super.verbose(`[VERBOSE] ${message}`, context);
  }
}
