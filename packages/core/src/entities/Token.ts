import { Protocol } from '@fanbase/shared';

import User from './User';

export class Token {
  readonly id: string;
  dateCreated: Date;

  userId: string;
  creatorId: string;
  creator: User;
  name: string;
  description: string;
  supply: number;
  minted: boolean;

  chain?: {
    protocol: Protocol;
    contract: string;
    name: string;
    symbol: string;
    id: string;
    transaction: string;
  };

  constructor(data?: Partial<Token>) {
    Object.assign(this, data);
  }
}

export default Token;
