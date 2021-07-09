import { TokenAttributes, TokenChainData, TokenFee, TokenType } from '@fanbase/shared';

import User from './User';

export class Token {
  readonly id: string;

  dateCreated: Date;

  creatorId: string;
  creator: User;

  type: TokenType;
  name: string;
  description: string;
  supply: number;

  image?: string;
  externalUrl?: string;

  fees?: TokenFee[];

  attributes?: TokenAttributes;
  extra?: unknown;

  chain?: TokenChainData;

  minted: boolean;

  constructor(data?: Partial<Token>) {
    Object.assign(this, data);
  }
}

export default Token;
