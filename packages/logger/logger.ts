import 'winston-daily-rotate-file';

import * as appRoot from 'app-root-path';
import * as crypto from 'crypto';
import * as winston from 'winston';

import WinstonCloudwatch from 'winston-cloudwatch';
import { getContext } from './context';

let packageName = process.env.npm_package_name;

export const setupLogger = (package_: string) => (packageName = package_);

const ctx = getContext();

const logFormat = (info: winston.LogEntry) => {
  const { level, message, ...metadata } = info;
  return {
    level,
    ...(packageName && { app: packageName }),
    message,
    ...metadata,
    ...ctx.get('context')
  };
};

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf((info) => JSON.stringify(logFormat(info), null, 2))
);

let loggerOpts: winston.LoggerOptions;

if (process.env.NODE_ENV === 'production') {
  const startTime = new Date().toISOString();

  loggerOpts = {
    transports: [
      new WinstonCloudwatch({
        logGroupName: 'api-production',
        logStreamName: function () {
          const date = new Date().toISOString().split('T')[0];
          return (
            date +
            '-' +
            crypto.createHash('md5').update(startTime).digest('hex')
          );
        },
        messageFormatter: (info) => JSON.stringify(logFormat(info))
      })
    ]
  };
} else if (process.env.HEROKU) {
  loggerOpts = {
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: jsonFormat
      }),
      new winston.transports.Console({
        level: 'error',
        format: jsonFormat,
        handleExceptions: true
      })
    ]
  };
} else {
  const rotationFileConfig = {
    format: jsonFormat,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  };

  loggerOpts = {
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
    ]
  };
}

const logger = winston.createLogger({
  ...loggerOpts,
  exitOnError: false
});

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => `[${info.level}] ${info.message}`)
      ),
      handleExceptions: true
    })
  );
}

export default logger;
