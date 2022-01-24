import { Button, TextInput } from '../ui';
import React, { useEffect, useState } from 'react';
import { WaitlistEntryType, WalletType } from '@fest/shared';
import { getCurrentUser, saveCurrentUser } from '../modules/auth/authStorage';

import { ApiClient } from '../modules/api';
import Head from 'next/head';
import { getProfileUrl } from '../utils';
import router from 'next/router';
import styled from '@emotion/styled';

const Box = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const Header = styled.div`
  padding: 15px 0;
`;

const CodeForm = styled.form`
  > div {
    display: flex;
    align-items: center;

    > * + * {
      margin-left: 10px;
    }
  }
`;

const ErrorMessage = styled.p`
  padding: 15px 0;
  color: red;
`;

const RequestSuccess = styled.p`
  padding: 15px 0;
  color: green;
`;

const Actions = styled.div`
  margin-top: 15px;
`;

export const CreatorPage = () => {
  const [enabled, setEnabled] = useState<boolean>(false);

  const redirect = () => router.push(getProfileUrl(getCurrentUser()));

  useEffect(() => {
    if (getCurrentUser()?.isCreator) redirect();
  }, []);

  useEffect(() => {
    if (enabled) setTimeout(() => redirect(), 5000);
  }, [enabled]);

  const [error, setError] = useState<string>();

  const enable = async (code: string) => {
    try {
      const response = await ApiClient.getInstance().enableCreatorMode(code);
      setEnabled(response.success);

      if (response.success) {
        saveCurrentUser({ ...getCurrentUser(), isCreator: true });
      }
    } catch (err) {
      setError(err.message);
      console.log(err);
    }
  };

  const [requestSent, setRequestSent] = useState(false);

  const requestAccess = async () => {
    setRequestSent(true);

    try {
      const { email, wallet } = getCurrentUser();
      const useWallet = wallet.type === WalletType.EXTERNAL;

      ApiClient.getInstance().joinWaitlist(
        WaitlistEntryType.CREATOR,
        email,
        useWallet,
        useWallet ? wallet.address : null
      );
    } catch (err) {
      console.log(err);
    }
  };

  const CodeInput = ({
    error,
    onSubmit
  }: {
    error?: string;
    onSubmit: (code: string) => void;
  }) => {
    const [code, setCode] = useState('');

    return (
      <CodeForm onSubmit={(e) => e.preventDefault()}>
        <div>
          <TextInput
            placeholder="Enter invite code"
            value={code}
            onChange={(e) => setCode(e.target.value?.toUpperCase())}
          />
          <Button
            type="submit"
            color="primary"
            onClick={() => onSubmit(code)}
            disabled={code.length < 1}
          >
            Submit
          </Button>
        </div>
        {error && <ErrorMessage className="small">{error}</ErrorMessage>}
      </CodeForm>
    );
  };

  return (
    <div className="container boxed">
      <Head>
        <title>Creator Program</title>
      </Head>
      <Box>
        <Header>
          <h1>Apply to the creator program</h1>
          <p>Are you a creator looking to build a community on Fest?</p>
        </Header>
        <CodeInput error={error} onSubmit={(code) => enable(code)} />
        <Actions>
          {!requestSent ? (
            <Button color="secondary" onClick={() => requestAccess()}>
              Request access
            </Button>
          ) : (
            <RequestSuccess className="small">
              Request has been sent.
            </RequestSuccess>
          )}
        </Actions>
      </Box>
    </div>
  );
};

export default CreatorPage;
