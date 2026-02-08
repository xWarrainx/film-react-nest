import { TskvLogger } from '../tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    stderrSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log method', () => {
    it('should output TSKV format with tabs', () => {
      logger.log('Test message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);

      const logOutput = stdoutSpy.mock.calls[0][0] as string;

      // Проверяем наличие полей TSKV
      expect(logOutput).toContain('timestamp=');
      expect(logOutput).toContain('level=LOG');
      expect(logOutput).toContain('message=Test message');
      expect(logOutput).toContain('context=TestContext');
      expect(logOutput.endsWith('\n')).toBe(true);
    });

    it('should escape special characters', () => {
      logger.log('Message with\ttab\nand newline', 'Context');

      const logOutput = stdoutSpy.mock.calls[0][0] as string;

      // Проверяем экранирование
      expect(logOutput).toContain('message=Message with\\ttab\\nand newline');
    });

    it('should handle object messages', () => {
      const testObject = { key: 'value' };
      logger.log(testObject, 'ObjectContext');

      const logOutput = stdoutSpy.mock.calls[0][0] as string;

      expect(logOutput).toContain('message={"key":"value"}');
    });
  });

  describe('error method', () => {
    it('should output to stderr with error level and trace', () => {
      // В NestJS error: (message, trace, context)
      logger.error('Error message', 'Stack trace', 'ErrorContext');

      expect(stderrSpy).toHaveBeenCalledTimes(1);

      const logOutput = stderrSpy.mock.calls[0][0] as string;

      expect(logOutput).toContain('level=ERROR');
      expect(logOutput).toContain('message=Error message');
      expect(logOutput).toContain('trace=Stack trace');
      expect(logOutput).toContain('context=ErrorContext');
    });

    it('should work without trace and context', () => {
      logger.error('Error message');

      const logOutput = stderrSpy.mock.calls[0][0] as string;

      expect(logOutput).toContain('level=ERROR');
      expect(logOutput).toContain('message=Error message');
    });
  });

  describe('warn method', () => {
    it('should output WARN level', () => {
      logger.warn('Warning message', 'WarnContext');

      const logOutput = stdoutSpy.mock.calls[0][0] as string;

      expect(logOutput).toContain('level=WARN');
      expect(logOutput).toContain('message=Warning message');
      expect(logOutput).toContain('context=WarnContext');
    });
  });
});
