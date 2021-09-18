import { Field, Form, Formik, FormikErrors, FormikProps, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { Balance, TokenListingDTO, WalletType } from '@fanbase/shared';

import { ApiClient } from '../modules/api';
import useAuthentication from '../modules/auth/useAuthentication';
import { useBalance } from '../modules/useBalance';
import { useWeb3 } from '../modules/web3';
import { Button, FormInput, TextInput } from '../ui';
import Modal from '../ui/Modal';
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
  const web3 = useWeb3();

  const [isSelecting, setSelecting] = useState(true);

  const isCustodialWallet = currentUser.wallet.type == WalletType.INTERNAL;

  const [isMarketApprovedSpender, setMarketApprovedSpender] = useState(false);

  const [balance, setBalance] = useBalance(0, listing.price.currency.decimals);
  const [approvedAllowance, setApprovedAllowance] = useBalance(
    0,
    listing.price.currency.decimals
  );

  const tokenPrice = Balance(listing.price.amount, listing.price.currency);

  const [quantity, setQuantity] = useState(1);

  const [subtotal, setSubtotal] = useBalance(
    0,
    listing.price.currency.decimals
  );
  const [total, setTotal] = useBalance(0, listing.price.currency.decimals);

  const [hasSufficientBalance, setHasSufficientBalance] = useState(false);

  const BUY_FEE_FACTOR = 1.05;

  useEffect(() => {
    if (!balance) return;

    setHasSufficientBalance(balance.amount.greaterThanOrEqualTo(total.amount));
  }, [balance, total]);

  useEffect(() => {
    const sub = tokenPrice.amount.mul(quantity);

    setTotal(sub.mul(BUY_FEE_FACTOR));
    setSubtotal(sub);
  }, [quantity]);

  useEffect(() => {
    if (!web3.ethereum) return;

    if (!isCustodialWallet) {
      web3.ethereum
        .getApprovedSpenderERC20Amount(
          listing.price.currency.contract,
          currentUser.wallet.address,
          listing.chain.contract
        )
        .then((allowance: string) => {
          setApprovedAllowance(allowance);
        });
    }

    web3.ethereum
      .getERC20Balance(
        listing.price.currency.contract,
        currentUser.wallet.address
      )
      .then((newBalance: string) => {
        setBalance(newBalance);
      });
  }, [web3.ethereum]);

  useEffect(() => {
    setMarketApprovedSpender(
      approvedAllowance.amount.greaterThanOrEqualTo(total.amount)
    );
  }, [total, approvedAllowance]);

  const FormValidator = () => {
    const { validateForm } = useFormikContext();

    useEffect(() => {
      validateForm();
    }, [hasSufficientBalance]);

    return null;
  };

  return isSelecting ? (
    <Modal show={true} requestClose={() => setBuying(false)}>
      <Container>
        <Formik
          initialValues={{
            quantity
          }}
          validate={(values) => {
            const errors: FormikErrors<{
              quantity: string;
            }> = {};

            if (
              !values.quantity ||
              values.quantity < 1 ||
              values.quantity > listing.available
            ) {
              errors.quantity = `Quantity needs to be 1-${listing.available}`;
            }

            if (!hasSufficientBalance) {
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
                  {listing.price.currency.symbol}{' '}
                  {balance.displayAmount.toString()}
                </h3>
              </FormInput>
              <OrderInfo className="two-col">
                <FormInput label="Price per token">
                  <h5 style={{ opacity: 0.5 }}>
                    {listing.price.currency.symbol}{' '}
                    {tokenPrice.displayAmount.toString()}
                  </h5>
                </FormInput>
                <FormInput label="Available">
                  <h5 style={{ opacity: 0.5 }}>{listing.available}</h5>
                </FormInput>
              </OrderInfo>
              <div className="two-col">
                <FormInput label="Order amount">
                  <h4>
                    {listing.price.currency.symbol}{' '}
                    {subtotal.displayAmount.toString()}
                  </h4>
                  <p className="smaller" style={{ padding: '10px 0' }}>
                    +{' '}
                    {subtotal.displayAmount.div(100).mul(5).toDP(2).toString()}{' '}
                    fee
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
                      setQuantity(val > 0 ? parseInt(val) : 0);
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
              <FormValidator />
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
      executeTransaction={async () => {
        if (!isCustodialWallet) {
          if (!isMarketApprovedSpender) {
            console.log(total.amount.toFixed());
            const tx = await web3.ethereum.buildApproveERC20SpenderTX(
              listing.price.currency.contract,
              currentUser.wallet.address,
              listing.chain.contract,
              total.amount.toFixed()
            );

            return web3.ethereum.sendTx(tx);
          } else {
            const tx = await web3.ethereum.buildBuyTokenListingTx(
              currentUser.wallet.address,
              listing.chain.contract,
              listing.chain.id,
              quantity
            );

            return web3.ethereum.sendTx(tx);
          }
        } else {
          return ApiClient.instance?.buyTokenListing(listing.id, quantity);
        }
      }}
      onTransactionSent={async (hash: string, end) => {
        if (isCustodialWallet || isMarketApprovedSpender) {
          end();
        } else {
          await web3.awaitTxConfirmation(hash);
          setMarketApprovedSpender(true);
        }
      }}
      onFinished={() => onBought()}
    >
      <p>Order total: {total.displayAmount.toString()}</p>
    </TransactionModal>
  );
};

export default BuyTokenListing;
