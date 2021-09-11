import React from 'react';

import { Contracts } from '@fanbase/eth-contracts';

import EthereumClient from '../modules/ethereum/EthereumClient';
import { getPrice } from '../utils';
import TransactionModal from './TransactionModal';

type WithdrawEarningsProps = {
  currency: string;
  amount: string;
  onClose: () => void;
  onDone: () => void;
};

export const WithdrawEarnings = ({
  currency,
  amount,
  onClose,
  onDone
}: WithdrawEarningsProps) => {
  const balance = getPrice(amount);

  return (
    <TransactionModal
      show={true}
      title="Withdraw all earnings to wallet?"
      requestClose={() => onClose()}
      executeTransaction={() => {
        let contract;

        switch (currency) {
          case 'DAI':
            contract = process.env.ETH_CONTRACT_DAI_ADDRESS;
            break;
          case 'FAN':
            contract = Contracts.FAN.get().options.address;
            break;
        }

        return EthereumClient.instance.withdrawEarnings(contract, amount);
      }}
      onTransactionSent={async (txHash: string, last) => {
        last();
      }}
      onFinished={() => {
        onDone();
      }}
    >
      <p>
        Withdraw amount: {balance.currency} {balance.amount}
      </p>
    </TransactionModal>
  );
};

export default WithdrawEarnings;
