import Web3 from 'web3';

import { EthereumService } from '@fanbase/ethereum';
import Postgres from '@fanbase/postgres';

import App from './App';
import { appConfig, ethConfig, postgresConfig } from './config';

const web3 = new Web3(ethConfig.provider);

(async () => {
  await Postgres.init(postgresConfig);
  console.log('Connected to database.');

  await EthereumService.init(web3);
  console.log('Connected to Ethereum.');

  new App(appConfig).start();
})();
