import React, { useEffect, useState } from 'react';
import { getCurrentUser, saveCurrentUser } from '../modules/auth/authStorage';

import { ApiClient } from '../modules/api';
import Head from 'next/head';
import Modal from '../ui/Modal';
import { TextInput } from '../ui';
import { getHomeUrl } from '../utils';
import { isValidPassword } from '@fanbase/shared';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import { useRouter } from 'next/router';

export const EmailChangePage = () => {
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

  const { setCurrentUser } = useAuthentication();

  const [error, setError] = useState<string>();

  const onSubmit = () => {
    if (!submitEnabled) return;
    setSubmitting(true);

    ApiClient.getInstance()
      .changeEmailAddress(token as string, password)
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

  return (
    <div className="container">
      <Head>
        <title>Change email</title>
      </Head>
      <Modal
        show={true}
        title={
          tokenInvalid ? 'Invalid or expired token.' : 'Confirm email change'
        }
        description={
          !tokenInvalid ? 'Enter your password to confirm the change.' : null
        }
        ok={!tokenInvalid ? 'Change email address' : null}
        okEnabled={submitEnabled}
        {...(tokenInvalid && {
          description: 'Please try again by requesting another email change.'
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

export default EmailChangePage;
