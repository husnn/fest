import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisClientType } from 'redis';
import { isDev } from '../config';
import { HttpError } from '../http';

let redis: RedisClientType;

export const initRateLimiters = (redisClient) => {
  redis = redisClient;
};

export const getRateLimiter = (
  name = 'default',
  opts: { max?: number; windowInMins?: number; message?: string } = {
    max: 100,
    windowInMins: 5
  }
) => {
  switch (name) {
    default:
      return rateLimit({
        windowMs: opts.windowInMins * 60 * 1000,
        max: isDev ? 0 : opts.max,
        handler: (request, response, next, options) => {
          next(
            new HttpError(
              opts.message ||
                'Too many requests. Wait a few minutes and try again.',
              429
            )
          );
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
          prefix: `service:api:rate-limiting:${name}:`,
          sendCommand: (...args: string[]) => redis.sendCommand(args)
        })
      });
  }
};
