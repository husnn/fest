import { BalanceClass, Currency } from '@fanbase/shared';

export type CurrencyBalance = {
  currency: Currency;
  balance: BalanceClass;
  selected?: boolean;
  precision?: number;
};

export default CurrencyBalance;
