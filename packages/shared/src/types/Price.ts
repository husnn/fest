import { Currency } from './Currency';

export type Price = {
  currency: Currency;
  amount: string;
  displayAmount: number;
};
