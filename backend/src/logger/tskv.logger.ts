import { Injectable } from '@nestjs/common';
import { LoggerService } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private formatMessage(
    level: string,
    message: any,
    ...optionalParams: any[]
  ): string {
    const timestamp = new Date().toISOString();
    const messageStr =
      typeof message === 'object' ? JSON.stringify(message) : String(message);

    const fields: Record<string, string> = {
      timestamp,
      level,
      message: this.escapeTskvValue(messageStr),
    };

    // Анализируем optionalParams как в JsonLogger
    if (optionalParams.length > 0) {
      if (level === 'ERROR') {
        // Для error: optionalParams[0] = trace, optionalParams[1] = context
        if (optionalParams[0]) {
          fields.trace = this.escapeTskvValue(String(optionalParams[0]));
        }
        if (optionalParams[1]) {
          fields.context = this.escapeTskvValue(String(optionalParams[1]));
        }
      } else {
        // Для других методов: optionalParams[0] = context
        if (optionalParams[0]) {
          fields.context = this.escapeTskvValue(String(optionalParams[0]));
        }
      }
    }

    // Форматируем в TSKV
    const tskvLine = Object.entries(fields)
      .map(([key, value]) => `${key}=${value}`)
      .join('\t');

    return tskvLine + '\n';
  }

  private escapeTskvValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
      .replace(/\r/g, '\\r');
  }

  log(message: any, ...optionalParams: any[]) {
    process.stdout.write(this.formatMessage('LOG', message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    process.stderr.write(
      this.formatMessage('ERROR', message, ...optionalParams),
    );
  }

  warn(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('WARN', message, ...optionalParams),
    );
  }

  debug(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('DEBUG', message, ...optionalParams),
    );
  }

  verbose(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('VERBOSE', message, ...optionalParams),
    );
  }
}
