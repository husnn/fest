import { Protocol, TokenTradeStatus } from '@fanbase/shared';

import Token from './Token';
import Wallet from './Wallet';

export class TokenTrade {
  readonly id: string;

  dateCreated: Date;

  protocol: Protocol;

  sellerWalletId: string;
  sellerWallet: Wallet;

  tokenId: string;
  token: Token;

  quantity: number;
  available: number;

  currency: string;
  price: string;

  chain: {
    contract: string;
    id: string;
    tx: string;
  };

  status: TokenTradeStatus;

  constructor(data?: Partial<TokenTrade>) {
    Object.assign(this, data);
  }
}

export default TokenTrade;
