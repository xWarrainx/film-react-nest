import { DevLogger } from '../dev.logger';

describe('DevLogger', () => {
  let logger: DevLogger;

  beforeEach(() => {
    logger = new DevLogger('TestContext');
  });

  describe('instance', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.verbose).toBe('function');
    });
  });

  describe('methods', () => {
    let originalConsoleLog: any;
    let logs: string[] = [];

    beforeEach(() => {
      logs = [];
      originalConsoleLog = console.log;
      console.log = jest.fn((...args) => {
        logs.push(args.join(' '));
      });
    });

    afterEach(() => {
      console.log = originalConsoleLog;
    });

    it('should call log method without throwing', () => {
      expect(() => {
        logger.log('Test message');
      }).not.toThrow();
    });

    it('should call error method without throwing', () => {
      expect(() => {
        logger.error('Error message', 'Trace', 'ErrorContext');
      }).not.toThrow();
    });

    it('should call warn method without throwing', () => {
      expect(() => {
        logger.warn('Warning message', 'WarnContext');
      }).not.toThrow();
    });
  });
});
