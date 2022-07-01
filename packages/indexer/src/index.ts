require('dotenv').config(); // eslint-disable-line

import DiscordGuildMembership, {
  DiscordGuildMembershipJob
} from './jobs/DiscordGuildMembership';
import Postgres, {
  CommunityRepository,
  NotificationRepository,
  OAuthRepository,
  TokenListingRepository,
  TokenOwnershipRepository,
  TokenRepository,
  TokenTradeRepository,
  UserRepository,
  WalletRepository,
  defaultConfig as postgresConfig
} from '@fest/postgres';
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
import { ethConfig, redisConfig } from './config';

import { DiscordService } from '@fest/discord';
import EthereumListener from './events/ethereum/EthereumListener';
import { EthereumService } from '@fest/ethereum';
import { NotificationService } from '@fest/core';
import Queue from 'bee-queue';
import Web3 from 'web3';
import { createServer } from './server';
import redis from 'redis';

const redisClient = redis.createClient(redisConfig.url);

const config: Queue.QueueSettings = {
  prefix: 'service:indexer:event-queue',
  redis: redisClient
};

const mintQueue = new Queue('TOKENS_MINTED', config);
const transferQueue = new Queue('TOKENS_TRANSFERRED', config);

const tokenTradeQueue = new Queue('TOKEN_TRADES', config);

const discordGuildMembershipQueue = new Queue('DISCORD_GUILD_MEMBERSHIP', {
  ...config,
  activateDelayedJobs: true
})
  .on('job failed', (_, err: Error) => console.log(err))
  .on('job retrying', (id) => console.log(`Retrying job ${id}.`));

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
  const oAuthRepository = new OAuthRepository();
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

  const discordService = new DiscordService();

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
      communityRepository,
      discordGuildMembershipQueue
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

  discordGuildMembershipQueue.process(
    (job: Queue.Job<DiscordGuildMembershipJob>) => {
      return new DiscordGuildMembership(job.data).execute(
        oAuthRepository,
        communityRepository,
        discordService
      );
    }
  );

  createServer();
})();
