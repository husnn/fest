import { CurrentUserDTO, Protocol, isEmailAddress } from '@fanbase/shared';
import React, { useEffect, useState } from 'react';
import { saveAuthToken, saveCurrentUser } from '../modules/auth/authStorage';

import ApiClient from '../modules/api/ApiClient';
import Button from '../ui/Button';
import Head from 'next/head';
import LoginWithEmail from '../components/LoginWithEmail';
import { TextInput } from '../ui';
import { getProfileUrl } from '../utils';
import styled from '@emotion/styled';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import { useRouter } from 'next/router';
import useWeb3 from '../modules/web3/useWeb3';

export default function Login() {
  useHeader([]);

  const router = useRouter();
  const { requestSignature, activate } = useWeb3();

  const { isAuthenticated, setAuthenticated, currentUser, setCurrentUser } =
    useAuthentication();

  const [loginWithEmail, setLoginWithEmail] = useState(false);

  const { redirect } = router.query;

  useEffect(() => {
    if (isAuthenticated) {
      router.push(
        (redirect && redirect.toString()) || getProfileUrl(currentUser)
      );
    }
  }, [isAuthenticated]);

  const onLogin = (token: string, user: CurrentUserDTO) => {
    if (!token || !user) return;

    saveAuthToken(token);
    saveCurrentUser(user);

    setCurrentUser(user);
    setAuthenticated(true);
  };

  const loginWithWallet = async () => {
    const wallet = await activate();
    if (!wallet) return;

    try {
      const identificationData = await ApiClient.instance?.identifyWithWallet(
        wallet
      );

      const signature = await requestSignature(
        identificationData.message,
        wallet
      );

      const { token, user } = await ApiClient.instance?.loginWithWallet(
        Protocol.ETHEREUM,
        identificationData.code,
        signature
      );

      onLogin(token, user);
    } catch (err) {
      console.log(`Could not login. ${err.message}`);
    }
  };

  const Container = styled.div`
    height: auto;
    width: 100%;
    position: absolute;
    top: 80px;
    display: flex;
    justify-content: center;
  `;

  const Box = styled.div`
    width: 100%;
    margin: 20px auto;
    padding: 50px 30px 30px;
    background-color: white;
    border-radius: 20px;
    box-shadow: 0px 5px 10px 5px rgba(0, 0, 0, 0.05);

    display: flex;
    flex-direction: column;

    @media screen and (min-width: 500px) {
      max-width: 500px;
      margin-top: 50px;
    }

    @media screen and (max-height: 500px) {
      margin: 0 auto;
      padding: 30px 20px;
    }

    > * + * {
      margin-top: 20px;
    }
  `;

  const EmailInput = ({
    initialEmail,
    onSubmit
  }: {
    initialEmail: string;
    onSubmit: (email: string, exists: boolean) => void;
  }) => {
    const [email, setEmail] = useState(initialEmail || '');
    const [emailLoginEnabled, setEmailLoginEnabled] = useState(false);

    const checkEmail = async (email: string) => {
      setEmailLoginEnabled(false);

      const exists = await ApiClient.getInstance().doAuthPrecheck(email);
      onSubmit(email, exists);

      setEmailLoginEnabled(true);
    };

    return (
      <React.Fragment>
        <h2>Hey, friend 👋🏼</h2>
        <p className="small">
          Enter your email address to sign up or log into your existing account.
        </p>
        <TextInput
          placeholder="bruce@wayne.inc"
          value={email}
          onChange={(e) => {
            const v = e.target.value;
            setEmail(v);

            setEmailLoginEnabled(!!isEmailAddress(v));
          }}
        />

        <Button
          color="primary"
          disabled={!emailLoginEnabled}
          onClick={() => checkEmail(email)}
        >
          Continue with email
        </Button>
      </React.Fragment>
    );
  };

  const [email, setEmail] = useState('');
  const [isNewUser, setNewUser] = useState(false);

  return (
    <Container>
      <Head>
        <title>Continue to Fanbase</title>
      </Head>
      <Box>
        <EmailInput
          initialEmail={email}
          onSubmit={(email: string, exists: boolean) => {
            setEmail(email);
            setNewUser(!exists);
            setLoginWithEmail(true);
          }}
        />

        <p className="smaller" style={{ textAlign: 'center', opacity: 0.5 }}>
          Or if you&apos;re a crypto-maniac
        </p>

        <Button color="secondary" onClick={loginWithWallet}>
          Continue with wallet
        </Button>

        <LoginWithEmail
          email={email}
          newUser={isNewUser}
          showing={loginWithEmail}
          setShowing={setLoginWithEmail}
          onLogin={onLogin}
        />
      </Box>
    </Container>
  );
}
