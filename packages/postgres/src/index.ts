import 'reflect-metadata';

import { createConnection } from 'typeorm';

import entitySchemas from './schemas';
import { PostgresConfig } from './types';

export default {
  init: async ({ uri, host, port, database, username, password }: PostgresConfig) =>
    createConnection({
      type: 'postgres',
      ...(uri
        ? {
            url: uri
          }
        : {
            host,
            port,
            database,
            username,
            password
          }),
      synchronize: process.env.NODE_ENV !== 'production',
      entities: entitySchemas,
      ...(uri && {
        ssl: { rejectUnauthorized: false }
      })
    })
};

export * from './types';
export * from './repositories';
