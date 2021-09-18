import React from 'react';

import useAuthentication from '../modules/auth/useAuthentication';
import { useWeb3 } from '../modules/web3';
import { CurrencyBalance } from '../types';
import TransactionModal from './TransactionModal';

type WithdrawEarningsProps = {
  balance: CurrencyBalance;
  onClose: () => void;
  onDone: () => void;
};

export const WithdrawEarnings = ({
  balance,
  onClose,
  onDone
}: WithdrawEarningsProps) => {
  const { currentUser } = useAuthentication();
  const web3 = useWeb3();

  return (
    <TransactionModal
      show={true}
      title="Withdraw all earnings to wallet?"
      requestClose={() => onClose()}
      executeTransaction={async () => {
        const tx = await web3.ethereum.buildWithdrawMarketEarningsTx(
          currentUser.wallet.address,
          balance.currency.contract,
          balance.balance.amount.toFixed()
        );

        return web3.ethereum.sendTx(tx);
      }}
      onTransactionSent={async (txHash: string, end) => {
        end();
      }}
      onFinished={() => {
        onDone();
      }}
    >
      <p>
        Withdraw amount: {balance.currency.symbol}{' '}
        {balance.balance.displayAmount.toFixed(balance.precision || 5)}
      </p>
    </TransactionModal>
  );
};

export default WithdrawEarnings;
