import winston from 'winston';
import 'winston-daily-rotate-file';

let logger;

/**
 * Get shared logger instance.
 * @returns {import('winston').Logger}
 */
export function getLogger(opts = {}) {
  if (logger && !opts.forceNew) return logger;

  const defaultTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d'
  });

  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp, stack }) =>
        `${timestamp} [${level}] ${stack || message}`
      )
    ),
    transports: opts.transports || [defaultTransport, new winston.transports.Console()]
  });

  logger.dryRun = msg => logger.info(`[DRY RUN] ${msg}`);

  return logger;
}
