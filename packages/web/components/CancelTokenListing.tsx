import React from 'react';

import { TokenListingDTO, WalletType } from '@fest/shared';

import { ApiClient } from '../modules/api';
import useAuthentication from '../modules/auth/useAuthentication';
import { useWeb3 } from '../modules/web3';
import TransactionModal from './TransactionModal';

type CancelTokenListingProps = {
  listing: TokenListingDTO;
  onClose: () => void;
  onDone: () => void;
};

export const CancelTokenListing = ({
  listing,
  onClose,
  onDone
}: CancelTokenListingProps) => {
  const { currentUser } = useAuthentication(true);
  const web3 = useWeb3();

  return (
    <TransactionModal
      show={true}
      requestClose={() => onClose()}
      executeTransaction={async () => {
        if (currentUser.wallet.type == WalletType.INTERNAL) {
          return ApiClient.instance?.cancelTokenListing(listing.id);
        } else {
          const tx = await web3.ethereum.buildCancelTokenListingTx(
            currentUser.wallet.address,
            listing.chain.contract,
            listing.chain.id
          );

          return web3.ethereum.sendTx(tx);
        }
      }}
      onTransactionSent={async (hash: string, end) => {
        end();
      }}
      onFinished={() => {
        onDone();
      }}
    >
      <p>The remaining tokens will be returned to you.</p>
    </TransactionModal>
  );
};

export default CancelTokenListing;
