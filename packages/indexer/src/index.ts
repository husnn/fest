require('dotenv').config(); // eslint-disable-line

import { NotificationService } from '@fest/core';
import { EthereumService } from '@fest/ethereum';
import Postgres, {
  CommunityRepository,
  defaultConfig as postgresConfig,
  NotificationRepository,
  TokenListingRepository,
  TokenOwnershipRepository,
  TokenRepository,
  TokenTradeRepository,
  UserRepository,
  WalletRepository
} from '@fest/postgres';
import Queue from 'bee-queue';
import redis from 'redis';
import Web3 from 'web3';
import { ethConfig, redisConfig } from './config';
import EthereumListener from './events/ethereum/EthereumListener';
import TokenBuy, { TokenBuyJob } from './jobs/TokenBuy';
import TokenCancelListing, {
  TokenCancelListingJob
} from './jobs/TokenCancelListing';
import TokenListForSale, { TokenListForSaleJob } from './jobs/TokenListForSale';
import TokenMint, { TokenMintJob } from './jobs/TokenMint';
import TokenRoyaltyPayment, {
  TokenRoyaltyPaymentJob
} from './jobs/TokenRoyaltyPayment';
import TokenTransfer, { TokenTransferJob } from './jobs/TokenTransfer';
import { createServer } from './server';

const redisClient = redis.createClient(redisConfig.url);

const config: Queue.QueueSettings = {
  prefix: 'service:indexer:event-queue',
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

ethereumListener.on('market-trade', (event: TokenBuyJob) => {
  tokenTradeQueue.createJob(event).save();
});

ethereumListener.on('market-cancel', (event: TokenCancelListingJob) => {
  tokenTradeQueue.createJob(event).save();
});

ethereumListener.on(
  'market-royalty-payment',
  (event: TokenRoyaltyPaymentJob) => {
    tokenTradeQueue.createJob(event).save();
  }
);

(async () => {
  await Postgres.init(postgresConfig);
  console.log('Connected to database.');

  const ethereumService = await EthereumService.getInstance(web3);
  console.log('\nListening to all new events.');

  const userRepository = new UserRepository();
  const tokenRepository = new TokenRepository();
  const tokenListingRepository = new TokenListingRepository();
  const tokenTradeRepository = new TokenTradeRepository();
  const walletRepository = new WalletRepository();
  const ownershipRepository = new TokenOwnershipRepository();
  const communityRepository = new CommunityRepository();
  const notificationRepository = new NotificationRepository();

  const notificationService = new NotificationService(
    notificationRepository,
    userRepository
  );

  mintQueue.process(async (job: Queue.Job<TokenMintJob>) => {
    return new TokenMint(job.data).execute(
      tokenRepository,
      walletRepository,
      ownershipRepository,
      communityRepository
    );
  });

  transferQueue.process(async (job: Queue.Job<TokenTransferJob>) => {
    return new TokenTransfer(job.data).execute(
      tokenRepository,
      walletRepository,
      ownershipRepository,
      communityRepository
    );
  });

  tokenTradeQueue.process(
    async (
      job: Queue.Job<
        | TokenListForSaleJob
        | TokenBuyJob
        | TokenCancelListingJob
        | TokenRoyaltyPaymentJob
      >,
      done
    ) => {
      if ((job.data as TokenListForSaleJob).seller !== undefined) {
        // Sell event
        return new TokenListForSale(job.data as TokenListForSaleJob).execute(
          tokenRepository,
          walletRepository,
          tokenListingRepository,
          ethereumService
        );
      } else if ((job.data as TokenBuyJob).buyer !== undefined) {
        // Buy event
        return new TokenBuy(job.data as TokenBuyJob).execute(
          tokenListingRepository,
          walletRepository,
          tokenTradeRepository,
          notificationService
        );
      } else if ((job.data as TokenCancelListingJob).canceller !== undefined) {
        // Cancellation event
        return new TokenCancelListing(
          job.data as TokenCancelListingJob
        ).execute(tokenListingRepository);
      } else if ((job.data as TokenRoyaltyPaymentJob).receiver !== undefined) {
        // Royalty payment
        return new TokenRoyaltyPayment(
          job.data as TokenRoyaltyPaymentJob
        ).execute(walletRepository, ethereumService, notificationService);
      }

      done();
    }
  );

  createServer();
})();
