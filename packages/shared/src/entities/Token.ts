import { Protocol } from '../enums';
import User from './User';

export class Token {
  readonly id: string;
  userId: string;
  creatorId: string;
  creator: User;
  supply: number;
  minted: boolean;
  chain?: {
    protocol: Protocol;
    contract: string;
    name: string;
    symbol: string;
    id: number;
    transaction: string;
  };

  constructor (data?: Partial<Token>) {
    Object.assign(this, data);
  }
}

export default Token;
