import React, { useEffect, useRef, useState } from 'react';

import {
  CurrentUserDTO,
  isEmailAddress,
  isValidPassword
} from '@fanbase/shared';

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
  setStepIndex,
  setSteps,
  setOkEnabled,
  goBack,
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
        ok: 'Next'
      },
      {
        title: 'Enter password',
        description: 'Log in to your existing account or create a new one.',
        ok: 'Send code',
        backable: true
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
  const [password, setPassword] = useState('');

  const login = async (email: string, code: string) => {
    setError(null);
    setOkEnabled(false);

    try {
      const { token, user } = await ApiClient.instance?.loginWithEmail(
        email,
        password,
        code
      );

      onLogin(token, user);
      close();
    } catch (err) {
      setStepIndex(0);
      setOkEnabled(true);
      setError('Incorrect password or code. Try again.');
    }
  };

  const identify = async () => {
    setOkEnabled(false);

    try {
      await ApiClient.getInstance()?.identifyWithEmail(email, password);
      goForward();
    } catch (err) {
      goBack();
      console.log(err);
    }
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (stepIndex == 0) {
      goForward();
      setPassword('');
      setOkEnabled(false);
    }

    if (stepIndex == 1) {
      identify();
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
                setError(null);

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
              pressOk();
            }}
          >
            <TextInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                const text = e.target.value;
                setPassword(text);
                setOkEnabled(!!isValidPassword(text));
              }}
            />
          </form>
        )}
        {stepIndex == 2 && (
          <DigitInput
            length={6}
            onEnter={(code: string) => {
              login(email, code);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ModalWithSteps(LoginWithEmail);
