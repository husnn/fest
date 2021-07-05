import {
    generateTokenOwnershipId, generateWalletId, TokenOwnership, TokenOwnershipRepository,
    TokenRepository, Wallet, WalletRepository
} from '@fanbase/core';
import { Protocol, WalletType } from '@fanbase/shared';

import Job from './Job';

export type TokenTransferProps = {
  protocol: Protocol;
  contract: string;
  from: string;
  to: string;
  id: string;
  quantity: number;
};

export default class TokenTransfer extends Job {
  private protocol: Protocol;
  private contract: string;
  private from: string;
  private to: string;
  private id: string;
  private quantity: number;

  constructor(props: TokenTransferProps) {
    super();

    Object.assign(this, props);
  }

  async execute(
    tokenRepository: TokenRepository,
    walletRepository: WalletRepository,
    ownershipRepository: TokenOwnershipRepository
  ): Promise<void> {
    try {
      const token = await tokenRepository.findByChainData({
        protocol: this.protocol,
        contract: this.contract,
        id: this.id
      });

      if (!token) return;

      const fromWallet = await walletRepository.findByAddress(
        this.protocol,
        this.from
      );

      if (fromWallet) {
        const fromOwnership = await ownershipRepository.findByWalletAndToken(
          fromWallet.id,
          token.id
        );

        console.log(`From ownership: \n${JSON.stringify(fromOwnership)}`);

        if (fromOwnership) {
          const newQuantity =
            this.quantity < fromOwnership.quantity
              ? fromOwnership.quantity - this.quantity
              : 0;

          fromOwnership.quantity = newQuantity;
          await ownershipRepository.update(fromOwnership);
        }
      }

      let toWallet = await walletRepository.findByAddress(
        this.protocol,
        this.to
      );

      if (!toWallet) {
        toWallet = new Wallet({
          id: generateWalletId(),
          type: WalletType.EXTERNAL,
          protocol: this.protocol,
          address: this.to
        });

        await walletRepository.create(toWallet);

        const toOwnership = new TokenOwnership({
          id: generateTokenOwnershipId(),
          walletId: toWallet.id,
          tokenId: token.id,
          quantity: this.quantity
        });

        await ownershipRepository.create(toOwnership);
      } else {
        let toOwnership = await ownershipRepository.findByWalletAndToken(
          toWallet.id,
          token.id
        );

        if (!toOwnership) {
          toOwnership = new TokenOwnership({
            id: generateTokenOwnershipId(),
            walletId: toWallet.id,
            tokenId: token.id,
            quantity: this.quantity
          });
        } else {
          toOwnership.quantity += this.quantity;
        }

        await ownershipRepository.update(toOwnership);

        console.log(`To ownership: \n${JSON.stringify(toOwnership)}`);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
