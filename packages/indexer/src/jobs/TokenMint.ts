import { TokenRepository } from '@fanbase/core';
import { decryptText, Protocol } from '@fanbase/shared';

import Job from './Job';

export type TokenMintProps = {
  protocol: Protocol;
  tx: string;
  contract: string;
  id: string;
  data: string;
};

export default class TokenMint extends Job {
  private protocol: Protocol;
  private tx: string;
  private contract: string;
  private id: string;
  private data: string;

  constructor(props: TokenMintProps) {
    super();

    Object.assign(this, props);
  }

  async execute(tokenRepository: TokenRepository): Promise<void> {
    try {
      const tokenId = decryptText(this.data);

      console.log('Data: ' + this.data);
      console.log('Token ID: ' + tokenId);

      const token = await tokenRepository.get(tokenId);

      if (!token) throw new Error('Could not find token.');
      if (token.minted) throw new Error('Token has already been minted.');

      token.chain = {
        protocol: this.protocol,
        contract: this.contract,
        name: 'Creator',
        symbol: 'CRT',
        id: this.id,
        transaction: this.tx
      };

      token.minted = true;

      tokenRepository.update(token);
    } catch (err) {
      console.log(err);
    }
  }
}
