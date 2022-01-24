import Postgres, { defaultConfig as postgresConfig } from '@fest/postgres';
import { appConfig, ethConfig, indexerConfig } from './config';

import App from './App';
import { EthereumService } from '@fest/ethereum';
import Web3 from 'web3';
import net from 'net';
import { setInterval } from 'timers';
import { setupLogger } from './logger';

const web3 = new Web3(ethConfig.provider);

const connectToIndexer = () => {
  const MAX_CONN_ATTEMPTS = 5;
  const CONN_ATTEMPT_INTERVAL = 5000;

  const { host: indexerHost, port: indexerPort } = indexerConfig;

  const connect = (attempt = 1) => {
    if (attempt > MAX_CONN_ATTEMPTS) {
      console.log('\n Could not connect to Indexer service.');
      process.exit(1);
    }

    console.log(`Attempting connection to Indexer (#${attempt})`);

    const client = new net.Socket();

    client.connect(indexerPort, indexerHost, () => {
      attempt = 0;
      client.setKeepAlive(true, 1000);

      console.log('Connected to Indexer.');
    });

    const checkHealth = setInterval(() => client.write('health'), 1000);

    client.on('error', (err: string) => {
      clearInterval(checkHealth);
      console.log(`Error getting indexer. ${err}`);

      setTimeout(() => connect(attempt + 1), CONN_ATTEMPT_INTERVAL);
    });
  };

  connect();
};

(async () => {
  await Postgres.init(postgresConfig);
  console.log('Connected to database.');

  await EthereumService.getInstance(web3);
  console.log('Connected to Ethereum.');

  if (process.env.BYPASS_INDEXER_CONNECTION !== 'true') {
    connectToIndexer();
  }

  setupLogger('api');

  new App(appConfig).start();
})();
