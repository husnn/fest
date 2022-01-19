import React, { useEffect, useState } from 'react';
import { WalletType, isValidPassword } from '@fanbase/shared';
import { getCurrentUser, saveCurrentUser } from '../modules/auth/authStorage';

import { ApiClient } from '../modules/api';
import Head from 'next/head';
import Modal from '../ui/Modal';
import { TextInput } from '../ui';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import { useRouter } from 'next/router';
import { useWeb3 } from '../modules/web3';

export const EmailChangePage = () => {
  useHeader([]);

  const router = useRouter();

  const { token, walletType, expiry } = router.query;

  const [password, setPassword] = useState<string>();

  const tokenInvalid =
    !token || !expiry || new Date() >= new Date(Number(expiry) * 1000);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitEnabled = !tokenInvalid && !submitting && !submitted;

  const { setCurrentUser } = useAuthentication();

  const [error, setError] = useState<string>();

  const onSubmit = (signature?: string) => {
    if (!submitEnabled) return;
    setSubmitting(true);

    ApiClient.getInstance()
      .changeEmailAddress(token as string, password, signature)
      .then((res) => {
        const updateUser = getCurrentUser();

        if (updateUser) {
          updateUser.email = res.email;

          saveCurrentUser(updateUser);
          setCurrentUser(updateUser);
        }

        setSubmitting(false);
        setSubmitted(true);
      })
      .catch((err) => {
        setSubmitting(false);
        setError(err.message);
        console.log(err);
      });
  };

  useEffect(() => {
    if (submitted) router.push('/login');
  }, [submitted]);

  const { requestSignature, activate } = useWeb3();

  const requestSignatureAndSend = async () => {
    setError(null);

    try {
      const address = await activate();
      const signedMessage = await requestSignature(token as string, address);
      onSubmit(signedMessage);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Change email</title>
      </Head>
      {walletType === WalletType.EXTERNAL ? (
        <Modal
          show={true}
          title={
            tokenInvalid ? 'Invalid or expired token.' : 'Confirm email change'
          }
          description={
            !tokenInvalid
              ? 'We need your signature to confirm this change.'
              : 'Please try again by requesting another email change.'
          }
          ok="Sign message"
          okEnabled={submitEnabled}
          onOkPressed={() => requestSignatureAndSend()}
          error={error}
        />
      ) : (
        <Modal
          show={true}
          title={
            tokenInvalid ? 'Invalid or expired token.' : 'Confirm email change'
          }
          description={
            !tokenInvalid
              ? 'Enter your password to confirm the change.'
              : 'Please try again by requesting another email change.'
          }
          ok={!tokenInvalid ? 'Change email address' : null}
          okEnabled={submitEnabled && isValidPassword(password)}
          onOkPressed={() => onSubmit()}
          requestClose={() => (tokenInvalid ? router.push('/login') : null)}
          error={error}
        >
          {!tokenInvalid && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <TextInput
                type="password"
                placeholder="Password"
                onChange={(e) => {
                  setError(null);
                  setPassword(e.target.value);
                }}
              />
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default EmailChangePage;
