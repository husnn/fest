import 'winston-daily-rotate-file';

import * as appRoot from 'app-root-path';
import * as crypto from 'crypto';
import * as winston from 'winston';

import WinstonCloudwatch from 'winston-cloudwatch';
import { getCtxMetadata } from './context';

let packageName = process.env.npm_package_name;

const logFormat = (info: winston.LogEntry) => {
  const { level, message, ...metadata } = info;
  return {
    level,
    ...(packageName && { app: packageName }),
    message,
    ...metadata,
    ...getCtxMetadata()
  };
};

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

let logger: winston.Logger;
let transports: winston.transport[] = [];

const setupLogger = (package_: string) => {
  packageName = package_;

  if (!isProd) return;

  const startTime = new Date().toISOString();

  transports = [
    new WinstonCloudwatch({
      level: 'info',
      logGroupName: `${packageName}-${process.env.NODE_ENV}`,
      logStreamName: function () {
        const date = new Date().toISOString().split('T')[0];
        const hash = crypto.createHash('md5').update(startTime).digest('hex');
        return `${date}-${hash}`;
      },
      messageFormatter: (info) => JSON.stringify(logFormat(info))
    })
  ];

  logger = winston.createLogger({ transports });
};

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf((info) => JSON.stringify(logFormat(info), null, 2))
);

if (process.env.HEROKU) {
  transports = [
    new winston.transports.Console({
      level: 'info',
      format: jsonFormat
    })
  ];
} else {
  const rotationFileConfig = {
    format: jsonFormat,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  };

  transports = [
    new winston.transports.DailyRotateFile({
      ...rotationFileConfig,
      filename: `${appRoot}/logs/info-%DATE%.log`,
      level: 'info'
    }),
    new winston.transports.DailyRotateFile({
      ...rotationFileConfig,
      filename: `${appRoot}/logs/error-%DATE%.log`,
      level: 'error'
    })
  ];
}

if (isDev) {
  transports.push(
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

logger = winston.createLogger({
  transports,
  exitOnError: false
});

export { logger, setupLogger };
