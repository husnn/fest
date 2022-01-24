import { BalanceClass, Currency } from '@fest/shared';

export type CurrencyBalance = {
  currency: Currency;
  balance: BalanceClass;
  selected?: boolean;
  precision?: number;
};

export default CurrencyBalance;
