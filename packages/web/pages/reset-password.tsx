import React, { useEffect, useState } from 'react';
import {
  getCurrentUser,
  saveAuthToken,
  saveCurrentUser
} from '../modules/auth/authStorage';

import { ApiClient } from '../modules/api';
import Head from 'next/head';
import Modal from '../ui/Modal';
import { TextInput } from '../ui';
import { getHomeUrl } from '../utils';
import { isValidPassword } from '@fanbase/shared';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import { useRouter } from 'next/router';

export const ResetPasswordPage = () => {
  useHeader([]);

  const router = useRouter();

  const { token, expiry } = router.query;

  const [password, setPassword] = useState('');

  const tokenInvalid =
    !token || !expiry || new Date() >= new Date(Number(expiry) * 1000);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitEnabled =
    !tokenInvalid && !submitting && !submitted && isValidPassword(password);

  const { setCurrentUser, setAuthenticated } = useAuthentication();

  const [error, setError] = useState<string>();

  const onSubmit = () => {
    if (!submitEnabled) return;
    setSubmitting(true);
    ApiClient.getInstance()
      .resetPassword(token as string, password)
      .then((res) => {
        saveAuthToken(res.token);
        saveCurrentUser(res.user);

        setCurrentUser(res.user);
        setAuthenticated(true);

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

  return (
    <div className="container">
      <Head>
        <title>Reset password</title>
      </Head>
      <Modal
        show={true}
        title={
          tokenInvalid ? 'Invalid or expired token.' : 'Enter your new password'
        }
        ok={!tokenInvalid ? 'Change password' : null}
        okEnabled={submitEnabled}
        {...(tokenInvalid && {
          description: 'Please try again by requesting another reset email.'
        })}
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
                setError('');
                setPassword(e.target.value);
              }}
            />
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ResetPasswordPage;
