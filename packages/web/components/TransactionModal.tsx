import React, { useEffect, useState } from 'react';

import { useWeb3 } from '../modules/web3';
import SpinnerSvg from '../public/images/spinner.svg';
import Modal, { ModalProps } from '../ui/Modal';

type TransactionModalProps = {
  show: boolean;
  children?: React.ReactElement;
  txHash?: string;
  executeTransaction: () => Promise<string>;
  onTransactionSent?: (txHash: string, end: () => void) => Promise<void>;
  onFinished?: () => void;
};

export const TransactionModal = ({
  executeTransaction,
  onTransactionSent,
  onFinished,
  ok,
  okEnabled,
  ...props
}: TransactionModalProps & ModalProps) => {
  const web3 = useWeb3();

  const [executing, setExecuting] = useState(false);
  const [txHash, setTxHash] = useState(undefined);

  useEffect(() => {
    if (!txHash) return;

    web3.awaitTxConfirmation(txHash).then(() => onFinished());
  }, [txHash]);

  return txHash ? (
    <Modal
      {...props}
      title="All done."
      description="The transaction has been sent. It may take a few seconds for it to be
      processed. You may close this now."
      cancel="Close"
    >
      <SpinnerSvg fill="#000" />
      <span style={{ marginLeft: 10, fontSize: 14, verticalAlign: 'top' }}>
        Processing...
      </span>
    </Modal>
  ) : (
    <Modal
      {...props}
      title="Are you sure?"
      description="This action cannot be undone."
      cancel="Cancel"
      ok={ok || 'Confirm'}
      okEnabled={okEnabled != undefined ? okEnabled && !executing : !executing}
      onOkPressed={async () => {
        setExecuting(true);

        try {
          const hash = await executeTransaction();

          onTransactionSent
            ? await onTransactionSent(hash, () => {
                setTxHash(hash);
              })
            : null;
        } catch (err) {
          console.log(err);
        }

        setExecuting(false);
      }}
    >
      {props.children}
    </Modal>
  );
};

export default TransactionModal;
