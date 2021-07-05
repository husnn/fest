import React, { useEffect, useRef, useState } from 'react';

import { CurrentUserDTO, isEmailAddress } from '@fanbase/shared';

import ApiClient from '../modules/api/ApiClient';
import styles from '../styles/Login.module.scss';
import DigitInput from '../ui/DigitInput';
import TextInput from '../ui/TextInput';
import ModalWithSteps, { ModalWithStepsProps } from './ModalWithSteps';

type LoginWithEmailProps = {
  onLogin: (token: string, user: CurrentUserDTO) => void;
};

const LoginWithEmail: React.FC<LoginWithEmailProps & ModalWithStepsProps> = ({
  onLogin,
  stepIndex,
  setSteps,
  setOkEnabled,
  goForward,
  onOkPressed,
  pressOk,
  close,
  setError
}: LoginWithEmailProps & ModalWithStepsProps) => {
  useEffect(() => {
    setSteps([
      {
        title: 'Enter your email address',
        description: 'Log in to your existing account or create a new one.',
        ok: 'Send code'
      },
      {
        title: 'Enter login code',
        description: 'We sent a one-time code to your email.',
        ok: 'Submit',
        backable: true
      }
    ]);
  }, []);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const login = async (email: string, code: string) => {
    setError(null);
    setOkEnabled(false);
    try {
      const { token, user } = await ApiClient.instance?.loginWithEmail(
        email,
        code
      );

      onLogin(token, user);
      close();
    } catch (err) {
      setOkEnabled(true);
      setError('Incorrect or expired code.');
    }
  };

  const sendCode = async () => {
    setOkEnabled(false);
    try {
      await ApiClient.getInstance()?.identifyWithEmail(email);
      goForward();
    } catch (err) {
      console.log(err);
    }
    setOkEnabled(true);
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (stepIndex == 0) {
      sendCode();
      goForward ? goForward() : null;
    }

    if (stepIndex == 1) {
      login(email, code);
    }
  }, [onOkPressed]);

  return (
    <div className={styles.loginWithEmail}>
      <div className={styles.loginWithEmailStep}>
        {stepIndex == 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              pressOk();
            }}
          >
            <TextInput
              type="email"
              placeholder="vader@deathstar.space"
              value={email}
              onChange={(e) => {
                const text = e.target.value;
                setEmail(text);
                setOkEnabled(!!isEmailAddress(text));
              }}
            />
          </form>
        )}
        {stepIndex == 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login(email, code);
            }}
          >
            <DigitInput
              onDelete={() => {
                setCode('');
                setError(null);
              }}
              onEnter={(code: string) => {
                login(email, code);
                setCode(code);
              }}
            />
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalWithSteps(LoginWithEmail);
