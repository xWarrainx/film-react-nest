import { JsonLogger } from '../json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log method', () => {
    it('should output valid JSON string', () => {
      logger.log('Test message', 'TestContext');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(() => JSON.parse(logOutput)).not.toThrow();

      const parsedLog = JSON.parse(logOutput);
      expect(parsedLog).toHaveProperty('timestamp');
      expect(parsedLog).toHaveProperty('level', 'LOG');
      expect(parsedLog).toHaveProperty('message', 'Test message');
      expect(parsedLog).toHaveProperty('context', 'TestContext');
    });
  });

  describe('error method', () => {
    it('should output error level in JSON with correct parameters', () => {
      // В NestJS: error(message, trace, context)
      logger.error('Error message', 'Error trace', 'ErrorContext');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog.level).toBe('ERROR');
      expect(parsedLog.message).toBe('Error message');
      expect(parsedLog.trace).toBe('Error trace'); // ВТОРОЙ параметр - trace
      expect(parsedLog.context).toBe('ErrorContext'); // ТРЕТИЙ параметр - context
    });

    it('should work with only message', () => {
      logger.error('Error message');

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog.level).toBe('ERROR');
      expect(parsedLog.message).toBe('Error message');
      expect(parsedLog.trace).toBeUndefined();
      expect(parsedLog.context).toBeUndefined();
    });
  });

  describe('warn method', () => {
    it('should output warn level in JSON', () => {
      logger.warn('Warning message', 'WarnContext');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      const logOutput = consoleWarnSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog.level).toBe('WARN');
      expect(parsedLog.message).toBe('Warning message');
      expect(parsedLog.context).toBe('WarnContext');
    });
  });

  describe('debug and verbose methods', () => {
    let consoleDebugSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    });

    it('should output debug level', () => {
      logger.debug('Debug message', 'DebugContext');

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);

      const logOutput = consoleDebugSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog.level).toBe('DEBUG');
      expect(parsedLog.message).toBe('Debug message');
    });

    it('should output verbose level', () => {
      logger.verbose('Verbose message', 'VerboseContext');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog.level).toBe('VERBOSE');
      expect(parsedLog.message).toBe('Verbose message');
    });
  });
});