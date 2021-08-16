import React, { useState } from 'react';

import { TokenListingDTO, WalletType } from '@fanbase/shared';

import { ApiClient } from '../modules/api';
import useAuthentication from '../modules/auth/useAuthentication';
import EthereumClient from '../modules/ethereum/EthereumClient';
import Modal from '../ui/Modal';

type CancelTokenListingProps = {
  listing: TokenListingDTO;
  onDone: () => void;
};

export const CancelTokenListing = ({
  listing,
  onDone
}: CancelTokenListingProps) => {
  const { currentUser } = useAuthentication(true);
  const [isCancelling, setCancelling] = useState(false);

  const cancelListing = async (listing: TokenListingDTO) => {
    setCancelling(true);

    try {
      let hash;

      if (currentUser.wallet.type == WalletType.INTERNAL) {
        hash = await ApiClient.instance?.cancelTokenListing(listing.id);
      } else {
        hash = await EthereumClient.instance?.cancelTokenListing(
          listing.chain.id
        );
      }

      await EthereumClient.instance.checkTxConfirmation(hash);

      onDone();
    } catch (err) {
      console.log(err);
    }

    setCancelling(false);
  };

  return (
    <Modal
      show={true}
      requestClose={() => onDone()}
      title="Are you sure?"
      description="This action cannot be reversed"
      ok="Confirm"
      okEnabled={!isCancelling}
      onOkPressed={() => cancelListing(listing)}
      cancel="Cancel"
    >
      <p>The remaining tokens will be returned to you.</p>
    </Modal>
  );
};

export default CancelTokenListing;
