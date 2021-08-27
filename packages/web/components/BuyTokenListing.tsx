import { Field, Form, Formik, FormikProps } from 'formik';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

import styled from '@emotion/styled';
import { TokenListingDTO, WalletType } from '@fanbase/shared';

import { ApiClient } from '../modules/api';
import useAuthentication from '../modules/auth/useAuthentication';
import EthereumClient from '../modules/ethereum/EthereumClient';
import { Button, FormInput, TextInput } from '../ui';
import Modal from '../ui/Modal';
import { getPrice } from '../utils';
import TransactionModal from './TransactionModal';

const Container = styled.div`
  > * + * {
    margin-top: 20px;
  }

  form {
    display: flex;
    flex-direction: column;

    > * + * {
      margin-top: 20px;
    }
  }
`;
const OrderInfo = styled.div``;

type BuyTokenListingProps = {
  listing: TokenListingDTO;
  setBuying: (value: boolean) => void;
  onBought: () => void;
};

const BuyTokenListing = ({
  listing,
  setBuying,
  onBought
}: BuyTokenListingProps) => {
  const { currentUser } = useAuthentication();

  const [isSelecting, setSelecting] = useState(true);

  const isCustodialWallet = currentUser.wallet.type == WalletType.INTERNAL;

  const [approvedAllowance, setApprovedAllowance] = useState(0);
  const [isMarketApprovedSpender, setMarketApprovedSpender] = useState(false);

  const { currency: currencySymbol } = getPrice(
    listing.chain.contract,
    listing.price
  );

  const [quantity, setQuantity] = useState(1);

  const pricePerToken = getPrice(listing.chain.contract, listing.price).amount;

  const subtotal = pricePerToken * quantity;

  const total = subtotal * 1.05;

  const [balance, setBalance] = useState(0);
  const hasSufficientBalance = balance >= total;

  useEffect(() => {
    if (!isCustodialWallet) {
      EthereumClient.instance
        .getApprovedAllowance(listing.currency, listing.chain.contract)
        .then((allowance: string) => {
          setApprovedAllowance(parseFloat(Web3.utils.fromWei(allowance)));
        });
    }

    EthereumClient.instance
      .getERC20Balance(listing.currency, currentUser.wallet.address)
      .then((balance: string) => {
        setBalance(parseFloat(balance));
      });
  }, []);

  useEffect(() => {
    setMarketApprovedSpender(approvedAllowance >= total);
  }, [total, approvedAllowance]);

  return isSelecting ? (
    <Modal show={true} requestClose={() => setBuying(false)}>
      <Container>
        <Formik
          initialValues={{
            quantity
          }}
          validate={(values) => {
            const errors: any = {};

            if (
              !values.quantity ||
              values.quantity < 1 ||
              values.quantity > listing.available
            ) {
              errors.quantity = `Quantity needs to be between 0 and ${
                listing.available + 1
              }`;
            }

            if (total > balance) {
              errors.quantity = 'Insufficient balance';
            }

            return errors;
          }}
          onSubmit={async () => {
            setSelecting(false);
          }}
        >
          {({
            values,
            handleChange,
            errors,
            isValid,
            isSubmitting
          }: FormikProps<{
            quantity: number;
          }>) => (
            <Form>
              <FormInput label="Your balance">
                <h3 style={{ opacity: 0.5 }}>
                  {currencySymbol} {balance.toFixed(2)}
                </h3>
              </FormInput>
              <OrderInfo className="two-col">
                <FormInput label="Price per token">
                  <h5 style={{ opacity: 0.5 }}>
                    {currencySymbol} {pricePerToken.toFixed(2)}
                  </h5>
                </FormInput>
                <FormInput label="Available">
                  <h5 style={{ opacity: 0.5 }}>{listing.available}</h5>
                </FormInput>
              </OrderInfo>
              <div className="two-col">
                <FormInput label="Order amount">
                  <h4>
                    {currencySymbol} {subtotal.toFixed(2)}
                  </h4>
                  <p className="smaller" style={{ padding: '10px 0' }}>
                    + {((subtotal / 100) * 5).toFixed(3)} fee
                  </p>
                </FormInput>
                <FormInput label="Quantity" error={errors.quantity as string}>
                  <Field
                    type="number"
                    id="quantity"
                    component={TextInput}
                    value={values.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuantity(val > 0 ? val : 0);
                      handleChange(e);
                    }}
                  />
                </FormInput>
              </div>
              <Button
                type="submit"
                color="primary"
                disabled={!isValid || isSubmitting}
              >
                Confirm
              </Button>
            </Form>
          )}
        </Formik>
      </Container>
    </Modal>
  ) : (
    <TransactionModal
      show={true}
      requestClose={() => setBuying(false)}
      ok={
        hasSufficientBalance
          ? isMarketApprovedSpender || isCustodialWallet
            ? 'Confirm order'
            : 'Approve market'
          : 'Insufficient balance'
      }
      okEnabled={hasSufficientBalance}
      executeTransaction={() => {
        if (!isCustodialWallet) {
          if (!isMarketApprovedSpender) {
            return EthereumClient.instance.approveSpender(
              listing.currency,
              listing.chain.contract,
              Web3.utils.toWei(total.toString())
            );
          } else {
            return EthereumClient.instance.buyTokenListing(
              listing.chain.contract,
              listing.chain.id,
              quantity
            );
          }
        } else {
          return ApiClient.instance?.buyTokenListing(listing.id, quantity);
        }
      }}
      onTransactionSent={async (hash: string, end) => {
        if (isCustodialWallet || isMarketApprovedSpender) {
          end();
        } else {
          await EthereumClient.instance.checkTxConfirmation(hash);
          setMarketApprovedSpender(true);
        }
      }}
      onFinished={() => onBought()}
    >
      <p>Order total: {total.toFixed(2)}</p>
    </TransactionModal>
  );
};

export default BuyTokenListing;
