import 'winston-daily-rotate-file';

import * as appRoot from 'app-root-path';
import * as crypto from 'crypto';
import * as winston from 'winston';

import WinstonCloudwatch from 'winston-cloudwatch';
import { getContext } from './context';

let packageName = process.env.npm_package_name;

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

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf((info) => JSON.stringify(logFormat(info), null, 2))
);

const consoleLogFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `[${info.level}] ${info.message}`)
);

export const setupLogger = (package_: string) => (packageName = package_);

const rotationFileConfig = {
  format: fileFormat,
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
};

export const logger = winston.createLogger({
  exitOnError: false
});

if (process.env.NODE_ENV === 'production') {
  const startTime = new Date().toISOString();

  logger.add(
    new WinstonCloudwatch({
      logGroupName: 'api-production',
      logStreamName: function () {
        const date = new Date().toISOString().split('T')[0];
        return (
          date + '-' + crypto.createHash('md5').update(startTime).digest('hex')
        );
      },
      messageFormatter: (info) => JSON.stringify(logFormat(info))
    })
  );
} else {
  logger.add(
    new winston.transports.DailyRotateFile({
      ...rotationFileConfig,
      filename: `${appRoot}/logs/info-%DATE%.log`,
      level: 'info'
    })
  );
  logger.add(
    new winston.transports.DailyRotateFile({
      ...rotationFileConfig,
      filename: `${appRoot}/logs/error-%DATE%.log`,
      level: 'error',
      handleExceptions: true
    })
  );
}

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
