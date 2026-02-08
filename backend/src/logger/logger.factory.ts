import { LoggerService } from '@nestjs/common';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

export class LoggerFactory {
  static createLogger(): LoggerService {
    const loggerType = process.env.LOGGER_TYPE || 'dev';

    switch (loggerType.toLowerCase()) {
      case 'json':
        return new JsonLogger();
      case 'tskv':
        return new TskvLogger();
      case 'dev':
      default:
        return new DevLogger();
    }
  }
}