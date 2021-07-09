require('dotenv').config(); // eslint-disable-line

import Queue from 'bee-queue';
import redis from 'redis';
import Web3 from 'web3';

import Postgres, {
    TokenOwnershipRepository, TokenRepository, TokenTradeRepository, WalletRepository
} from '@fanbase/postgres';

import { ethConfig, postgresConfig, redisConfig } from './config';
import EthereumListener from './events/ethereum/EthereumListener';
import TokenBuy, { TokenBuyProps } from './jobs/TokenBuy';
import TokenListForSale, { TokenListForSaleProps } from './jobs/TokenListForSale';
import TokenMint, { TokenMintProps } from './jobs/TokenMint';
import TokenTransfer, { TokenTransferProps } from './jobs/TokenTransfer';

const redisClient = redis.createClient(redisConfig.url);

const config: Queue.QueueSettings = {
  redis: redisClient
};

const mintQueue = new Queue('TOKENS_MINTED', config);
const transferQueue = new Queue('TOKENS_TRANSFERRED', config);

const tokenTradeQueue = new Queue('TOKEN_TRADES', config);

const provider = new Web3.providers.WebsocketProvider(ethConfig.provider);
const web3 = new Web3(provider);

const ethereumListener = new EthereumListener(web3, redisClient);

ethereumListener.on('token-mint', (event: TokenMintProps) => {
  mintQueue.createJob(event).save();
});

ethereumListener.on('token-transfer', (event: TokenTransferProps) => {
  transferQueue.createJob(event).save();
});

ethereumListener.on('market-list', (event: TokenListForSaleProps) => {
  tokenTradeQueue.createJob(event).save();
});

ethereumListener.on('market-buy', (event: TokenBuyProps) => {
  tokenTradeQueue.createJob(event).save();
});

console.log('Listening to events on the Ethereum network.');

Postgres.init(postgresConfig).then(() => {
  console.log('Connected to database.');

  const tokenRepository = new TokenRepository();
  const tokenTradeRepository = new TokenTradeRepository();
  const walletRepository = new WalletRepository();
  const ownershipRepository = new TokenOwnershipRepository();

  mintQueue.process(async (job: Queue.Job<TokenMintProps>) => {
    const task = new TokenMint(job.data);
    await task.execute(tokenRepository, walletRepository, ownershipRepository);
  });

  transferQueue.process(async (job: Queue.Job<TokenTransferProps>) => {
    const task = new TokenTransfer(job.data);
    return task.execute(tokenRepository, walletRepository, ownershipRepository);
  });

  tokenTradeQueue.process(
    async (job: Queue.Job<TokenListForSaleProps | TokenBuyProps>, done) => {
      if ((job.data as TokenListForSaleProps).seller !== undefined) {
        // Sell event
        return new TokenListForSale(job.data as TokenListForSaleProps).execute(
          tokenRepository,
          walletRepository,
          tokenTradeRepository
        );
      } else if ((job.data as TokenBuyProps).buyer !== undefined) {
        // Buy event
        return new TokenBuy(job.data as TokenBuyProps).execute(
          tokenTradeRepository
        );
      }

      done();
    }
  );
});
