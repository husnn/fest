import { Field, Form, Formik, FormikProps } from 'formik';
import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { Contracts } from '@fanbase/eth-contracts';
import { TokenDTO, TokenOwnershipDTO, WalletType } from '@fanbase/shared';

import ApiClient from '../modules/api/ApiClient';
import useAuthentication from '../modules/auth/useAuthentication';
import useEthereum from '../modules/ethereum/useEthereum';
import { Button, FormInput, TextInput } from '../ui';

type CreateTokenListingProps = {
  token: TokenDTO;
  ownership: TokenOwnershipDTO;
  onSuccess?: (txHash: string) => void;
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
  const eth = useEthereum();

  const [marketApproved, setMarketApproved] = useState(false);

  useEffect(() => {
    if (currentUser.wallet.type == WalletType.EXTERNAL) {
      eth?.checkMarketApproval(currentUser.wallet.address).then((approved) => {
        setMarketApproved(approved);
      });
    }
  }, [eth]);

  const listForSale = async (quantity: number, price: number) => {
    const currency = Contracts.FAN.get().options.address;

    let txHash;

    if (currentUser.wallet.type == WalletType.INTERNAL) {
      txHash = await ApiClient.instance?.listForSale(
        token.id,
        quantity,
        currency,
        price
      );
    } else {
      const approval = await ApiClient.instance?.approveSale(
        token.id,
        quantity,
        currency,
        price
      );

      txHash = await eth.listForSale(
        token,
        quantity,
        currency,
        price,
        approval.expiry,
        approval.salt,
        approval.signature
      );
    }

    onSuccess(txHash);
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
            errors.quantity = `Quantity needs to be between 0 and ${
              ownership.quantity + 1
            }`;
          }

          if (!values.price || values.price < 1 || values.price > 999999) {
            errors.price = `Price needs to be between 0 and 1,000,000`;
          }

          return errors;
        }}
        onSubmit={async (values) => {
          if (
            currentUser.wallet.type == WalletType.EXTERNAL &&
            !marketApproved
          ) {
            await eth.approveMarket();
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
              <FormInput label="Price" error={errors.price as string}>
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
              <Button type="submit" color="secondary" disabled={isSubmitting}>
                Approve market
              </Button>
            ) : (
              <Button type="submit" color="primary" disabled={isSubmitting}>
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
