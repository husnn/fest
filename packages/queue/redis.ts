import { RedisClientType, createClient } from 'redis';

import { redisConfig } from './config';

let redisClient: RedisClientType;

export const get = async (): Promise<RedisClientType> => {
  if (redisClient) return redisClient;

  redisClient = createClient({ url: redisConfig.url });
  await redisClient.connect();

  return redisClient;
};
