import { TokenChainData, TokenType } from '@fest/shared';
import Community from './Community';
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

  royaltyPct: number;

  attributes?: {
    [name: string]: string;
  };
  extra?: unknown;

  mediaUri?: string;
  metadataUri?: string;

  chain?: TokenChainData;

  minted: boolean;

  communities: Community[];

  constructor(data?: Partial<Token>) {
    Object.assign(this, data);
  }

  static getTypeName(type: TokenType): string {
    switch (type) {
      case TokenType.YT_VIDEO:
        return 'YouTube Video';
    }

    return 'Basic';
  }
}

export default Token;
