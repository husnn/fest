import appRoot from 'app-root-path';
import winston from 'winston';

let packageName = process.env.npm_package_name;

const consoleLogFormat = winston.format.printf((info) => {
  return `${packageName ? packageName + ':' : ''}${info.message}`;
});

export const setupLogger = (package_: string) => (packageName = package_);

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: `${appRoot}/logs/error.log`,
      level: 'error',
      handleExceptions: true,
      maxsize: 5242880
    }),
    new winston.transports.File({
      filename: `${appRoot}/logs/info.log`,
      level: 'info',
      maxsize: 5242880
    }),
    new winston.transports.Console({
      level: 'debug',
      format: consoleLogFormat,
      handleExceptions: true
    })
  ],
  exitOnError: false
});

export default logger;
