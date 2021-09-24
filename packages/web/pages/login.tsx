import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { CurrentUserDTO, Protocol } from '@fanbase/shared';

import LoginWithEmail from '../components/LoginWithEmail';
import ApiClient from '../modules/api/ApiClient';
import { saveAuthToken, saveCurrentUser } from '../modules/auth/authStorage';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import useWeb3 from '../modules/web3/useWeb3';
import styles from '../styles/Login.module.scss';
import Button from '../ui/Button';
import { getProfileUrl } from '../utils';

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

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <Head>
          <title>Continue to Fanbase</title>
        </Head>

        <Button color="primary" onClick={() => setLoginWithEmail(true)}>
          Continue with email
        </Button>

        <Button color="secondary" onClick={loginWithWallet}>
          Continue with wallet
        </Button>

        <LoginWithEmail
          showing={loginWithEmail}
          setShowing={setLoginWithEmail}
          onLogin={onLogin}
        />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {}
  };
};
