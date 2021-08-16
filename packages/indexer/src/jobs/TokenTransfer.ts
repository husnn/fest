import {
    generateTokenOwnershipId, generateWalletId, TokenOwnership, TokenOwnershipRepository,
    TokenRepository, Wallet, WalletRepository
} from '@fanbase/core';
import { Protocol, WalletType } from '@fanbase/shared';

import Job from './Job';

export type TokenTransferJob = {
  protocol: Protocol;
  contract: string;
  from: string;
  to: string;
  id: string;
  quantity: number;
};

export default class TokenTransfer extends Job<TokenTransferJob> {
  constructor(props: TokenTransferJob) {
    super(props);
  }

  async execute(
    tokenRepository: TokenRepository,
    walletRepository: WalletRepository,
    ownershipRepository: TokenOwnershipRepository
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

        // console.log(`From ownership: \n${JSON.stringify(fromOwnership)}`);

        if (fromOwnership) {
          const newQuantity =
            this.props.quantity < fromOwnership.quantity
              ? fromOwnership.quantity - this.props.quantity
              : 0;

          fromOwnership.quantity = newQuantity;
          await ownershipRepository.update(fromOwnership);
        }
      }

      let toWallet = await walletRepository.findByAddress(
        this.props.protocol,
        this.props.to
      );

      if (!toWallet) {
        toWallet = new Wallet({
          id: generateWalletId(),
          type: WalletType.EXTERNAL,
          protocol: this.props.protocol,
          address: this.props.to
        });

        await walletRepository.create(toWallet);

        const toOwnership = new TokenOwnership({
          id: generateTokenOwnershipId(),
          walletId: toWallet.id,
          tokenId: token.id,
          quantity: this.props.quantity
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
            quantity: this.props.quantity
          });
        } else {
          toOwnership.quantity += this.props.quantity;
        }

        await ownershipRepository.update(toOwnership);

        // console.log(`To ownership: \n${JSON.stringify(toOwnership)}`);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
