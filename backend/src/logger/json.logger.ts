import { Injectable } from '@nestjs/common';
import { LoggerService } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  private formatMessage(level: string, message: any, ...optionalParams: any[]) {
    const logEntry: Record<string, any> = {
      timestamp: new Date().toISOString(),
      level,
      message: typeof message === 'object' ? message : String(message),
    };

    // Анализируем optionalParams
    // В NestJS:
    // - Для error: первый параметр может быть trace, второй - context
    // - Для других методов: первый параметр - context
    if (optionalParams.length > 0) {
      if (level === 'ERROR') {
        if (optionalParams[0]) {
          logEntry.trace = optionalParams[0];
        }
        if (optionalParams[1]) {
          logEntry.context = optionalParams[1];
        }
      } else {
        if (optionalParams[0]) {
          logEntry.context = optionalParams[0];
        }
      }
    }

    // Удаляем undefined поля
    Object.keys(logEntry).forEach(key => {
      if (logEntry[key] === undefined) {
        delete logEntry[key];
      }
    });

    return JSON.stringify(logEntry);
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('LOG', message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('ERROR', message, ...optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage('WARN', message, ...optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatMessage('DEBUG', message, ...optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.info(this.formatMessage('VERBOSE', message, ...optionalParams));
  }
}