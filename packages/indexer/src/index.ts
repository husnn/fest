require('dotenv').config();

import Queue from 'bee-queue';
import redis from 'redis';
import Web3 from 'web3';

import Postgres, {
    TokenOwnershipRepository, TokenRepository, WalletRepository
} from '@fanbase/postgres';

import { ethConfig, postgresConfig, redisConfig } from './config';
import EthereumListener from './events/ethereum/EthereumListener';
import TokenMint, { TokenMintProps } from './jobs/TokenMint';
import TokenTransfer, { TokenTransferProps } from './jobs/TokenTransfer';

const redisClient = redis.createClient(redisConfig.url);

const config: Queue.QueueSettings = {
  redis: redisClient
};

const mintQueue = new Queue('TOKENS_MINTED', config);
const transferQueue = new Queue('TOKENS_TRANSFERRED', config);

const provider = new Web3.providers.WebsocketProvider(ethConfig.provider);
const web3 = new Web3(provider);

const ethereumListener = new EthereumListener(web3);

ethereumListener.on('token-mint', (event: TokenMint) => {
  mintQueue.createJob(event).save();
});

ethereumListener.on('token-transfer', (event: TokenTransfer) => {
  transferQueue.createJob(event).save();
});

console.log('Listening to events on the Ethereum network.');

Postgres.init(postgresConfig).then(() => {
  console.log('Connected to database.');

  const tokenRepository = new TokenRepository();
  const walletRepository = new WalletRepository();
  const ownershipRepository = new TokenOwnershipRepository();

  mintQueue.process(async (job: Queue.Job<TokenMintProps>) => {
    const task = new TokenMint(job.data);
    await task.execute(tokenRepository);
  });

  transferQueue.process(async (job: Queue.Job<TokenTransferProps>) => {
    const task = new TokenTransfer(job.data);
    await task.execute(tokenRepository, walletRepository, ownershipRepository);
  });
});
