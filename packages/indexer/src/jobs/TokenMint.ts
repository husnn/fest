import {
  CommunityRepository,
  TokenOwnership,
  TokenOwnershipRepository,
  TokenRepository,
  WalletRepository,
  generateTokenOwnershipId
} from '@fest/core';

import Job from './Job';
import JobData from './JobData';

export interface TokenMintJob extends JobData {
  contract: string;
  id: string;
  creator: string;
  supply: number;
  data: string;
}

export default class TokenMint extends Job<TokenMintJob> {
  constructor(props: TokenMintJob) {
    super(props);
  }

  async execute(
    tokenRepository: TokenRepository,
    walletRepository: WalletRepository,
    ownershipRepository: TokenOwnershipRepository,
    communityRepository: CommunityRepository
  ): Promise<void> {
    try {
      const tokenId = this.props.data;

      const token = await tokenRepository.get(tokenId);

      if (!token) throw new Error('Could not find token.');
      if (token.minted) throw new Error('Token has already been minted.');

      token.chain = {
        protocol: this.props.protocol,
        contract: this.props.contract,
        name: 'Fest Multi-Token',
        id: this.props.id,
        creator: this.props.creator,
        txHash: this.props.txHash
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

      communityRepository.addUserForToken(creatorWallet.ownerId, token.id);
    } catch (err) {
      console.log(err);
    }
  }
}
