import { EthereumService } from '@fest/ethereum';
import Postgres, {
  defaultConfig,
  MerlinPaymentRepository
} from '@fest/postgres';
import { Balance } from '@fest/shared';
import Web3 from 'web3';
import { ethConfig } from './config';

(async () => {
  await Postgres.init(defaultConfig);
  console.log('Connected to database.');

  const web3 = new Web3(ethConfig.provider);

  const ethereumService = await EthereumService.getInstance(web3);
  console.log('Connected to Ethereum.');
  console.log('Network ID: ' + ethereumService.networkId);

  const paymentRepository = new MerlinPaymentRepository();
  const zeroPointOne = Balance('100000000000000000', 18);
})();
