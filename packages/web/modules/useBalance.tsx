import Decimal from 'decimal.js';
import React, { useState } from 'react';

import { Balance, BalanceType } from '@fest/shared';

type Amount = string | number | Decimal;

export const useBalance = (
  amount: Amount,
  decimals = 18,
  dp = 3
): [BalanceType, (amount: Amount) => void] => {
  const instance = Balance(amount, { decimals, dp });

  const [balance, setRealBalance] = useState<BalanceType>({
    ...instance
  });

  const setBalance = (amount: Amount) => {
    instance.set(amount);
    setRealBalance({ ...instance });
  };

  return [balance, setBalance];
};
