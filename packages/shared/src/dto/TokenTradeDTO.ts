import TokenDTO from './TokenDTO';

export class TokenTradeDTO {
  readonly id: string;

  token: TokenDTO;

  quantity: number;
  available: number;

  currency: string;
  price: string;

  constructor(data?: Partial<TokenTradeDTO>) {
    Object.assign(this, data);
  }
}

export default TokenTradeDTO;
