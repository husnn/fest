import Decimal from 'decimal.js';

import { Currency } from './Currency';

export type BalanceType = {
  amount: Decimal;
  displayAmount: Decimal;
  decimals: number;
  dp: number;
};

export class BalanceClass implements BalanceType {
  amount: Decimal;
  displayAmount: Decimal;
  decimals: number;
  dp: number;

  constructor(amount: number | string | Decimal, decimals: number, dp: number) {
    this.set(amount, decimals, dp);
    return this;
  }

  set(amount: number | string | Decimal, decimals?: number, dp?: number) {
    if (decimals) this.decimals = decimals;
    if (dp) this.dp = dp;

    this.amount = new Decimal(amount);

    this.displayAmount = this.amount.greaterThan(0)
      ? this.amount
          .div(new Decimal(10).pow(this.decimals))
          .toDecimalPlaces(this.dp)
      : this.amount;

    return this;
  }
}

export const Balance = (
  amount: number | string | Decimal,
  decimalOptions:
    | {
        decimals?: number;
        dp?: number;
      }
    | (Pick<Currency, 'decimals'> & { dp: number })
    | number = 18
): BalanceClass => {
  const decimals =
    typeof decimalOptions === 'object'
      ? decimalOptions?.decimals || 18
      : (!isNaN(decimalOptions) && decimalOptions) || 18;

  const dp =
    (typeof decimalOptions === 'object' && decimalOptions?.decimals) || 3;

  return new BalanceClass(amount, decimals, dp);
};

export default Balance;
