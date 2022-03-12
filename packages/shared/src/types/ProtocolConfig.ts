import { MarketFees } from '..';
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
    defaultCurrency: Currency;
    currenciesSupported: Currency[];
    fees: MarketFees;
    percentageScale: string;
  };

  currencies: Currency[];
}
