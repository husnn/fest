import 'winston-daily-rotate-file';

import * as appRoot from 'app-root-path';
import * as winston from 'winston';

import { getContext } from './context';

let packageName = process.env.npm_package_name;

const ctx = getContext();

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...metadata } = info;
    return JSON.stringify(
      {
        timestamp,
        level,
        ...(packageName && { app: packageName }),
        message,
        ...metadata,
        ...ctx.get('context')
      },
      null,
      2
    );
  })
);

const consoleLogFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `[${info.level}] ${info.message}`)
);

export const setupLogger = (package_: string) => (packageName = package_);

const rotationFileConfig = {
  format: logFormat,
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
};

export const logger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      ...rotationFileConfig,
      filename: `${appRoot}/logs/info-%DATE%.log`,
      level: 'info'
    }),
    new winston.transports.DailyRotateFile({
      ...rotationFileConfig,
      filename: `${appRoot}/logs/error-%DATE%.log`,
      level: 'error',
      handleExceptions: true
    })
  ],
  exitOnError: false
});

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      level: 'debug',
      format: consoleLogFormat,
      handleExceptions: true
    })
  );
}

export default logger;
