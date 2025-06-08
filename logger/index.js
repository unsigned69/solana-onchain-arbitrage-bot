import winston from 'winston';
import 'winston-daily-rotate-file';

let logger;

export function getLogger() {
  if (logger) return logger;

  const transport = new winston.transports.DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d'
  });

  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`)
    ),
    transports: [transport, new winston.transports.Console()]
  });

  return logger;
}
