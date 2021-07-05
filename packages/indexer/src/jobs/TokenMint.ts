import {
    generateTokenOwnershipId, TokenOwnership, TokenOwnershipRepository, TokenRepository,
    WalletRepository
} from '@fanbase/core';
import { decryptText, Protocol } from '@fanbase/shared';

import Job from './Job';

export type TokenMintProps = {
  protocol: Protocol;
  tx: string;
  contract: string;
  id: string;
  creator: string;
  supply: number;
  data: string;
};

export default class TokenMint extends Job {
  private protocol: Protocol;
  private tx: string;
  private contract: string;
  private id: string;
  private creator: string;
  private supply: number;
  private data: string;

  constructor(props: TokenMintProps) {
    super();

    Object.assign(this, props);
  }

  async execute(
    tokenRepository: TokenRepository,
    walletRepository: WalletRepository,
    ownershipRepository: TokenOwnershipRepository
  ): Promise<void> {
    try {
      const tokenId = decryptText(this.data);

      const token = await tokenRepository.get(tokenId);

      if (!token) throw new Error('Could not find token.');
      if (token.minted) throw new Error('Token has already been minted.');

      token.chain = {
        protocol: this.protocol,
        contract: this.contract,
        name: 'Creator',
        symbol: 'CRT',
        id: this.id,
        creator: this.creator,
        transaction: this.tx
      };

      // token.minted = true;

      const creatorWallet = await walletRepository.findByAddress(
        this.protocol,
        this.creator
      );

      const ownership = new TokenOwnership({
        id: generateTokenOwnershipId(),
        walletId: creatorWallet.id,
        tokenId,
        quantity: this.supply
      });

      await ownershipRepository.create(ownership);

      await tokenRepository.update(token);
    } catch (err) {
      console.log(err);
    }
  }
}
