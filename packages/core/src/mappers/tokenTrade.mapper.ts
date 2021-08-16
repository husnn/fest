import { TokenTradeDTO } from '@fanbase/shared';

import { TokenTrade } from '../entities';

export const mapTokenTradeToDTO = (order: TokenTrade): TokenTradeDTO =>
  new TokenTradeDTO({ ...order });
