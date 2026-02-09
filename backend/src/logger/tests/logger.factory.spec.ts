import { LoggerFactory } from '../logger.factory';
import { DevLogger } from '../dev.logger';
import { JsonLogger } from '../json.logger';
import { TskvLogger } from '../tskv.logger';

describe('LoggerFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createLogger', () => {
    it('should create DevLogger by default', () => {
      delete process.env.LOGGER_TYPE;
      const logger = LoggerFactory.createLogger();

      expect(logger).toBeInstanceOf(DevLogger);
    });

    it('should create DevLogger when LOGGER_TYPE=dev', () => {
      process.env.LOGGER_TYPE = 'dev';
      const logger = LoggerFactory.createLogger();

      expect(logger).toBeInstanceOf(DevLogger);
    });

    it('should create JsonLogger when LOGGER_TYPE=json', () => {
      process.env.LOGGER_TYPE = 'json';
      const logger = LoggerFactory.createLogger();

      expect(logger).toBeInstanceOf(JsonLogger);
    });

    it('should create TskvLogger when LOGGER_TYPE=tskv', () => {
      process.env.LOGGER_TYPE = 'tskv';
      const logger = LoggerFactory.createLogger();

      expect(logger).toBeInstanceOf(TskvLogger);
    });

    it('should be case insensitive', () => {
      process.env.LOGGER_TYPE = 'JSON';
      const logger = LoggerFactory.createLogger();

      expect(logger).toBeInstanceOf(JsonLogger);
    });

    it('should fallback to DevLogger for unknown type', () => {
      process.env.LOGGER_TYPE = 'unknown';
      const logger = LoggerFactory.createLogger();

      expect(logger).toBeInstanceOf(DevLogger);
    });
  });
});
