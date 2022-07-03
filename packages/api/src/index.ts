import Postgres, { defaultConfig as postgresConfig } from '@fest/postgres';
import { appConfig, ethConfig, indexerConfig, redisConfig } from './config';

import App from './App';
import { EthereumService } from '@fest/ethereum';
import Web3 from 'web3';
import { createClient } from 'redis';
import { initRateLimiters } from './middleware/rateLimiting';
import logger from '@fest/logger';
import net from 'net';
import { setInterval } from 'timers';

const connectToIndexer = () => {
  const MAX_CONN_ATTEMPTS = 5;
  const CONN_ATTEMPT_INTERVAL = 5000;

  const { host: indexerHost, port: indexerPort } = indexerConfig;

  const connect = (attempt = 1) => {
    if (attempt > MAX_CONN_ATTEMPTS) {
      logger.error('Could not connect to Indexer service.');
      process.exit(1);
    }

    logger.info(`Attempting connection to Indexer (#${attempt})`);

    const client = new net.Socket();

    client.connect(indexerPort, indexerHost, () => {
      attempt = 0;
      client.setKeepAlive(true, 1000);

      logger.info('Connected to Indexer.');
    });

    const checkHealth = setInterval(() => client.write('health'), 1000);

    client.on('error', (err: string) => {
      clearInterval(checkHealth);
      logger.error(`Error getting indexer. ${err}`);

      setTimeout(() => connect(attempt + 1), CONN_ATTEMPT_INTERVAL);
    });
  };

  connect();
};

const web3 = new Web3(ethConfig.provider);

(async () => {
  await Postgres.init(postgresConfig);
  logger.info('Connected to database.');

  await EthereumService.getInstance(web3);
  logger.info('Connected to Ethereum.');

  if (process.env.BYPASS_INDEXER_CONNECTION !== 'true') {
    connectToIndexer();
  }

  const redisClient = createClient({ url: redisConfig.url });
  await redisClient.connect();

  initRateLimiters(redisClient);

  new App(appConfig).start();
})();
