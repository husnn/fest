import { Protocol, TokenAttributes, TokenFee, TokenType } from '@fanbase/shared';

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

  chain?: {
    protocol: Protocol;
    contract: string;
    name: string;
    symbol: string;
    id: string;
    creator: string;
    transaction: string;
  };

  minted: boolean;

  constructor(data?: Partial<Token>) {
    Object.assign(this, data);
  }
}

export default Token;
