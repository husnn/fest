import React, { useState } from 'react';

import { TokenListingDTO, WalletType } from '@fanbase/shared';

import { ApiClient } from '../modules/api';
import useAuthentication from '../modules/auth/useAuthentication';
import EthereumClient from '../modules/ethereum/EthereumClient';
import Modal from '../ui/Modal';
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
  return (
    <TransactionModal
      show={true}
      requestClose={() => onClose()}
      executeTransaction={() => {
        if (currentUser.wallet.type == WalletType.INTERNAL) {
          return ApiClient.instance?.cancelTokenListing(listing.id);
        } else {
          return EthereumClient.instance?.cancelTokenListing(listing.chain.id);
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
