import {
  CommunityRepository,
  TokenOwnership,
  TokenOwnershipRepository,
  TokenRepository,
  Wallet,
  WalletRepository,
  generateTokenOwnershipId,
  generateWalletId
} from '@fest/core';

import BeeQueue from 'bee-queue';
import { DiscordGuildMembershipJob } from './DiscordGuildMembership';
import Job from './Job';
import JobData from './JobData';
import { WalletType } from '@fest/shared';

export interface TokenTransferJob extends JobData {
  contract: string;
  from: string;
  to: string;
  id: string;
  quantity: number;
}

export default class TokenTransfer extends Job<TokenTransferJob> {
  constructor(props: TokenTransferJob) {
    super(props);
  }

  async execute(
    tokenRepository: TokenRepository,
    walletRepository: WalletRepository,
    ownershipRepository: TokenOwnershipRepository,
    communityRepository: CommunityRepository,
    guildMembershipQueue: BeeQueue
  ): Promise<void> {
    try {
      if (
        this.props.from ==
        ('0x0000000000000000000000000000000000000000' || this.props.to)
      )
        return;

      const token = await tokenRepository.findByChainData({
        protocol: this.props.protocol,
        contract: this.props.contract,
        id: this.props.id
      });

      if (!token) return;

      const fromWallet = await walletRepository.findByAddress(
        this.props.protocol,
        this.props.from
      );

      if (fromWallet) {
        const fromOwnership = await ownershipRepository.findByWalletAndToken(
          fromWallet.id,
          token.id
        );

        if (fromOwnership) {
          const newQuantity =
            this.props.quantity < fromOwnership.quantity
              ? fromOwnership.quantity - this.props.quantity
              : 0;

          fromOwnership.quantity = newQuantity;
          await ownershipRepository.update(fromOwnership);

          if (newQuantity == 0) {
            communityRepository.removeUserForToken(
              fromWallet.ownerId,
              token.id
            );

            if (token.creatorId != fromWallet.ownerId) {
              guildMembershipQueue
                .createJob({
                  type: 'remove',
                  userId: fromWallet.ownerId,
                  tokenId: token.id
                } as DiscordGuildMembershipJob)
                .backoff('fixed', 60 * 60 * 1000) // Retry after an hour
                .retries(1000)
                .save();
            }
          }
        }
      }

      let toWallet = await walletRepository.findByAddress(
        this.props.protocol,
        this.props.to
      );

      let toOwnership: TokenOwnership;

      if (!toWallet) {
        toWallet = new Wallet({
          id: generateWalletId()(),
          type: WalletType.EXTERNAL,
          protocol: this.props.protocol,
          address: this.props.to
        });

        await walletRepository.create(toWallet);

        toOwnership = new TokenOwnership({
          id: generateTokenOwnershipId()(),
          walletId: toWallet.id,
          tokenId: token.id,
          quantity: this.props.quantity
        });

        await ownershipRepository.create(toOwnership);
      } else {
        toOwnership = await ownershipRepository.findByWalletAndToken(
          toWallet.id,
          token.id
        );

        if (!toOwnership) {
          toOwnership = new TokenOwnership({
            id: generateTokenOwnershipId()(),
            walletId: toWallet.id,
            tokenId: token.id,
            quantity: this.props.quantity
          });
        } else {
          toOwnership.quantity += this.props.quantity;
        }

        await ownershipRepository.update(toOwnership);
      }

      if (toOwnership.quantity == this.props.quantity && toWallet.ownerId) {
        communityRepository.addUserForToken(toWallet.ownerId, token.id);

        guildMembershipQueue
          .createJob({
            type: 'add',
            userId: toWallet.ownerId,
            tokenId: token.id
          } as DiscordGuildMembershipJob)
          .backoff('fixed', 60 * 60 * 1000) // Retry after an hour
          .retries(1000)
          .save();
      }
    } catch (err) {
      console.log(err);
    }
  }
}
