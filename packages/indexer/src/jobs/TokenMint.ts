import { Protocol, decryptText } from '@fanbase/shared';
import {
  TokenOwnership,
  TokenOwnershipRepository,
  TokenRepository,
  WalletRepository,
  generateTokenOwnershipId
} from '@fanbase/core';

import Job from './Job';

export type TokenMintJob = {
  protocol: Protocol;
  tx: string;
  contract: string;
  id: string;
  creator: string;
  supply: number;
  data: string;
};

export default class TokenMint extends Job<TokenMintJob> {
  constructor(props: TokenMintJob) {
    super(props);
  }

  async execute(
    tokenRepository: TokenRepository,
    walletRepository: WalletRepository,
    ownershipRepository: TokenOwnershipRepository
  ): Promise<void> {
    try {
      const tokenId = decryptText(this.props.data);

      const token = await tokenRepository.get(tokenId);

      if (!token) throw new Error('Could not find token.');
      if (token.minted) throw new Error('Token has already been minted.');

      token.chain = {
        protocol: this.props.protocol,
        contract: this.props.contract,
        name: 'Creator',
        symbol: 'CRT',
        id: this.props.id,
        creator: this.props.creator,
        transaction: this.props.tx
      };

      token.minted = true;

      const creatorWallet = await walletRepository.findByAddress(
        this.props.protocol,
        this.props.creator
      );

      const ownership = new TokenOwnership({
        id: generateTokenOwnershipId()(),
        walletId: creatorWallet.id,
        tokenId,
        quantity: this.props.supply
      });

      await ownershipRepository.create(ownership);

      await tokenRepository.update(token);
    } catch (err) {
      console.log(err);
    }
  }
}
