import { Field, Form, Formik, FormikProps } from 'formik';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

import styled from '@emotion/styled';
import { TokenDTO, TokenOwnershipDTO, WalletType } from '@fanbase/shared';

import ApiClient from '../modules/api/ApiClient';
import useAuthentication from '../modules/auth/useAuthentication';
import { useWeb3 } from '../modules/web3';
import { Button, FormInput, TextInput } from '../ui';

type CreateTokenListingProps = {
  token: TokenDTO;
  ownership: TokenOwnershipDTO;
  onSuccess?: () => void;
};

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
const TokenInfo = styled.div``;
const ListingInfo = styled.div``;

export const CreateTokenListing = ({
  token,
  ownership,
  onSuccess
}: CreateTokenListingProps) => {
  const { currentUser } = useAuthentication();
  const web3 = useWeb3();

  const [marketApproved, setMarketApproved] = useState(false);

  useEffect(() => {
    if (!web3.ethereum) return;

    if (currentUser.wallet.type == WalletType.EXTERNAL) {
      web3.ethereum
        .checkMarketApproved(token.chain.contract, currentUser.wallet.address)
        .then((approved) => {
          setMarketApproved(approved); // TODO
        });
    }
  }, [web3.ethereum]);

  const listForSale = async (quantity: number, price: number) => {
    const currency = web3.config.market.defaultCurrency.contract;

    let txHash;

    const actualPrice = Web3.utils.toWei(price.toString());

    if (currentUser.wallet.type == WalletType.INTERNAL) {
      txHash = await ApiClient.instance?.listForSale(token.id, quantity, {
        currency,
        amount: actualPrice
      });
    } else {
      const approval = await ApiClient.instance?.approveSale(
        token.id,
        quantity,
        {
          currency,
          amount: actualPrice
        }
      );

      const tx = await web3.ethereum.buildListTokenForSaleTx(
        currentUser.wallet.address,
        token.chain.contract,
        token.chain.id,
        quantity,
        {
          currency,
          amount: actualPrice
        },
        approval.expiry,
        approval.salt,
        approval.signature
      );

      txHash = await web3.ethereum.sendTx(tx);
    }

    await web3.awaitTxConfirmation(txHash);

    onSuccess();
  };

  return (
    <Container>
      <TokenInfo>
        <p>{token.name}</p>
      </TokenInfo>
      <Formik
        initialValues={{
          quantity: 1,
          price: 100
        }}
        validate={(values) => {
          const errors: any = {};

          if (
            !values.quantity ||
            values.quantity < 1 ||
            values.quantity > ownership.quantity
          ) {
            errors.quantity = `Quantity needs to be 1-${ownership.quantity}`;
          }

          if (!values.price || values.price < 1 || values.price > 99999999) {
            errors.price = `Price needs to be between 0 and 100,000,000`;
          }

          return errors;
        }}
        onSubmit={async (values) => {
          if (
            currentUser.wallet.type == WalletType.EXTERNAL &&
            !marketApproved
          ) {
            const tx = await web3.ethereum.buildApproveMarketTx(
              token.chain.contract,
              currentUser.wallet.address
            );

            await web3.ethereum.sendTx(tx);

            setMarketApproved(true);
          } else {
            await listForSale(values.quantity, values.price);
          }
        }}
      >
        {({
          values,
          handleChange,
          errors,
          isSubmitting
        }: FormikProps<{
          quantity: number;
          price: number;
        }>) => (
          <Form>
            <ListingInfo className="form two-col">
              <FormInput label="Quantity" error={errors.quantity as string}>
                <Field
                  type="number"
                  id="quantity"
                  component={TextInput}
                  value={values.quantity}
                  onChange={handleChange}
                />
              </FormInput>
              <FormInput label="Price per token" error={errors.price as string}>
                <Field
                  type="number"
                  id="price"
                  component={TextInput}
                  value={values.price}
                  onChange={handleChange}
                />
              </FormInput>
            </ListingInfo>
            {currentUser.wallet.type == WalletType.EXTERNAL &&
            !marketApproved ? (
              <Button
                type="submit"
                color="secondary"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Approve market
              </Button>
            ) : (
              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                List for sale
              </Button>
            )}
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default CreateTokenListing;
