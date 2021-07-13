require('dotenv').config(); // eslint-disable-line

import Queue from 'bee-queue';
import redis from 'redis';
import Web3 from 'web3';

import Postgres, {
    TokenOwnershipRepository, TokenRepository, TokenTradeRepository, WalletRepository
} from '@fanbase/postgres';

import { ethConfig, postgresConfig, redisConfig } from './config';
import EthereumListener from './events/ethereum/EthereumListener';
import TokenBuy, { TokenBuyJob } from './jobs/TokenBuy';
import TokenListForSale, { TokenListForSaleJob } from './jobs/TokenListForSale';
import TokenMint, { TokenMintJob } from './jobs/TokenMint';
import TokenTransfer, { TokenTransferJob } from './jobs/TokenTransfer';

const redisClient = redis.createClient(redisConfig.url);

const config: Queue.QueueSettings = {
  redis: redisClient
};

const mintQueue = new Queue('TOKENS_MINTED', config);
const transferQueue = new Queue('TOKENS_TRANSFERRED', config);

const tokenTradeQueue = new Queue('TOKEN_TRADES', config);

const provider = process.env.ETH_PROVIDER_WSS
  ? new Web3.providers.WebsocketProvider(ethConfig.provider)
  : new Web3.providers.HttpProvider(ethConfig.provider);

const web3 = new Web3(provider);

const ethereumListener = new EthereumListener(web3, redisClient);

ethereumListener.on('token-mint', (event: TokenMintJob) => {
  mintQueue.createJob(event).save();
});

ethereumListener.on('token-transfer', (event: TokenTransferJob) => {
  transferQueue.createJob(event).save();
});

ethereumListener.on('market-list', (event: TokenListForSaleJob) => {
  tokenTradeQueue.createJob(event).save();
});

ethereumListener.on('market-buy', (event: TokenBuyJob) => {
  tokenTradeQueue.createJob(event).save();
});

Postgres.init(postgresConfig).then(() => {
  console.log('Connected to database.');

  const tokenRepository = new TokenRepository();
  const tokenTradeRepository = new TokenTradeRepository();
  const walletRepository = new WalletRepository();
  const ownershipRepository = new TokenOwnershipRepository();

  mintQueue.process(async (job: Queue.Job<TokenMintJob>) => {
    const task = new TokenMint(job.data);
    await task.execute(tokenRepository, walletRepository, ownershipRepository);
  });

  transferQueue.process(async (job: Queue.Job<TokenTransferJob>) => {
    const task = new TokenTransfer(job.data);
    return task.execute(tokenRepository, walletRepository, ownershipRepository);
  });

  tokenTradeQueue.process(
    async (job: Queue.Job<TokenListForSaleJob | TokenBuyJob>, done) => {
      if ((job.data as TokenListForSaleJob).seller !== undefined) {
        // Sell event
        return new TokenListForSale(job.data as TokenListForSaleJob).execute(
          tokenRepository,
          walletRepository,
          tokenTradeRepository
        );
      } else if ((job.data as TokenBuyJob).buyer !== undefined) {
        // Buy event
        return new TokenBuy(job.data as TokenBuyJob).execute(
          tokenTradeRepository
        );
      }

      done();
    }
  );
});
