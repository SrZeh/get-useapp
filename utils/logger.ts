/**
 * Structured logging utility with log levels and environment-based filtering
 * 
 * This utility provides a centralized logging system that:
 * - Filters logs based on environment (suppresses debug in production)
 * - Provides structured logging with context
 * - Prepares for integration with error reporting services (e.g., Sentry)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LoggerConfig {
  level: LogLevel;
  enableInProduction: boolean;
}

// Environment detection
const isDevelopment = __DEV__ ?? process.env.NODE_ENV === 'development';
const isProduction = !isDevelopment;

// Default config
const defaultConfig: LoggerConfig = {
  level: isProduction ? 'warn' : 'debug',
  enableInProduction: false,
};

// Log levels priority (higher number = higher priority)
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    if (isProduction && !this.config.enableInProduction && level === 'debug') {
      return false;
    }
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case 'debug':
        if (isDevelopment) {
          console.log(formattedMessage);
        }
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        // TODO: Integrate with error reporting service (e.g., Sentry)
        // if (isProduction) {
        //   Sentry.captureException(new Error(message), { extra: context });
        // }
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error 
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : String(error),
    };
    this.log('error', message, errorContext);
  }

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable logging in production (useful for debugging production issues)
   */
  enableProductionLogging(): void {
    this.config.enableInProduction = true;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for custom instances if needed
export { Logger, type LogLevel, type LogContext };

