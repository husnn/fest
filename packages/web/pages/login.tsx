import { CurrentUserDTO, Protocol, isEmailAddress } from '@fest/shared';
import React, { useEffect, useState } from 'react';
import { saveAuthToken, saveCurrentUser } from '../modules/auth/authStorage';

import ApiClient from '../modules/api/ApiClient';
import Button from '../ui/Button';
import Head from 'next/head';
import LoginWithEmail from '../components/LoginWithEmail';
import Modal from '../ui/Modal';
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

  const [requestInvite, setRequestInvite] = useState(false);

  const [loginWithEmail, setLoginWithEmail] = useState(false);

  const { redirect } = router.query;

  const [error, setError] = useState();

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

  const [connectingWallet, setConnectingWallet] = useState(false);

  const loginWithWallet = async () => {
    setConnectingWallet(true);

    const wallet = await activate();
    setConnectingWallet(false);

    if (!wallet) return;

    setError(null);

    try {
      const check = await ApiClient.getInstance().doAuthPrecheck(wallet);

      if (!check.exists && check.needsInvite && !inviteCode) {
        setRequestInvite(true);
        return;
      }

      const identificationData = await ApiClient.instance?.identifyWithWallet(
        wallet,
        inviteCode
      );

      const signature = await requestSignature(
        identificationData.message,
        wallet
      );

      const { token, user } = await ApiClient.getInstance().loginWithWallet(
        Protocol.ETHEREUM,
        identificationData.code,
        signature
      );

      onLogin(token, user);
    } catch (err) {
      setError(err.message);
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

  const InviteCode = styled.div`
    margin: -20px -15px 0;
    padding: 15px;
    background-color: #fafafa;
    border-radius: 10px;

    display: flex;
    justify-content: space-between;

    > img {
      padding: 5px;
      cursor: pointer;
      opacity: 0.5;
    }

    > img:hover {
      opacity: 0.7;
    }
  `;

  const EmailForm = styled.form`
    display: flex;
    flex-direction: column;

    > * + * {
      margin-top: 20px;
    }
  `;

  const AuthError = styled.p`
    color: red;
    text-align: center;
  `;

  const EmailInput = ({
    initialEmail,
    onSubmit
  }: {
    initialEmail: string;
    onSubmit: (
      email: string,
      check: { exists: boolean; needsInvite?: boolean }
    ) => void;
  }) => {
    const [email, setEmail] = useState(initialEmail || '');

    const [enabled, setEnabled] = useState(!!isEmailAddress(initialEmail));

    const doPrecheck = async (email: string) => {
      setEnabled(false);

      const check = await ApiClient.getInstance().doAuthPrecheck(email);
      onSubmit(email, check);

      setEnabled(true);
    };

    return (
      <EmailForm>
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

            setEnabled(!!isEmailAddress(v));
          }}
        />

        <Button
          color="primary"
          disabled={!enabled}
          onClick={() => doPrecheck(email)}
        >
          Continue with email
        </Button>
      </EmailForm>
    );
  };

  const [email, setEmail] = useState('');
  const [isNewUser, setNewUser] = useState(false);

  const [inviteCode, setInviteCode] = useState<string>();

  const InviteBox = ({
    onCodeSubmit
  }: {
    onCodeSubmit: (code: string) => void;
  } & React.HTMLAttributes<HTMLDivElement>) => {
    const [input, setInput] = useState('');

    return (
      <Modal
        show={true}
        title="Got an invite?"
        description="Fest is currently invite-only. Enter your code to get early access."
        ok="Enter"
        onOkPressed={() => onCodeSubmit(input)}
        okEnabled={true}
        requestClose={() => setRequestInvite(false)}
      >
        <TextInput
          placeholder="Invite code"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </Modal>
    );
  };

  const [passwordResetRequestSent, setPasswordResetRequestSent] =
    useState(false);

  return (
    <Container>
      <Head>
        <title>Continue to Fest</title>
      </Head>
      <Box>
        {inviteCode && (
          <InviteCode>
            <p>🎉 Your invite code &lsquo;{inviteCode}&rsquo; has been set.</p>
            <img
              src="images/ic-close.svg"
              width={20}
              onClick={() => {
                setInviteCode(null);
                setError(null);
              }}
            />
          </InviteCode>
        )}
        {requestInvite && (
          <InviteBox
            onCodeSubmit={(code: string) => {
              setInviteCode(code);
              setRequestInvite(false);
            }}
          />
        )}

        <EmailInput
          initialEmail={email}
          onSubmit={(email: string, check) => {
            setEmail(email);
            setNewUser(!check.exists);

            if (!check.exists && check.needsInvite && !inviteCode) {
              setRequestInvite(true);
              return;
            }

            setLoginWithEmail(true);
          }}
        />

        <p className="smaller" style={{ textAlign: 'center', opacity: 0.5 }}>
          Or if you&apos;re a crypto-maniac
        </p>

        <Button
          color="secondary"
          onClick={loginWithWallet}
          loading={connectingWallet}
        >
          Continue with wallet
        </Button>

        <AuthError className="smaller">{error}</AuthError>

        <LoginWithEmail
          email={email}
          inviteCode={inviteCode}
          newUser={isNewUser}
          showing={loginWithEmail}
          setShowing={setLoginWithEmail}
          onLogin={onLogin}
          onPasswordReset={() => {
            setLoginWithEmail(false);
            setPasswordResetRequestSent(true);
            setTimeout(() => setPasswordResetRequestSent(false), 5000);
          }}
        />

        <Modal
          show={passwordResetRequestSent}
          title="Check your email inbox"
          description={`We sent an email to ${email} with a link to reset your password.`}
        ></Modal>
      </Box>
    </Container>
  );
}
