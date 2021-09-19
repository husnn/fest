import { TokenStandard } from '../enums/TokenStandard';
import { Currency } from './Currency';

type TokenContract = {
  type: TokenStandard;
  contract: string;
};

export interface ProtocolConfig {
  networkId: number;
  chainId: number;

  defaultToken: TokenContract;

  tokens?: Array<TokenContract>;

  market: {
    contract: string;
    wallet: string;
    defaultCurrency: Currency;
    currenciesSupported: Currency[];
    fees: {
      buy: string;
      sell: string;
    };
    limits: {
      maxPrice: string;
      minPrice: string;
      maxQuantity: string;
    };
    percentageScale: string;
  };

  currencies: Currency[];
}
