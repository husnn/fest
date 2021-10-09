import { CurrentUserDTO, isValidPassword } from '@fanbase/shared';
import ModalWithSteps, { ModalWithStepsProps } from './ModalWithSteps';
import React, { useEffect, useRef, useState } from 'react';

import ApiClient from '../modules/api/ApiClient';
import DigitInput from '../ui/DigitInput';
import TextInput from '../ui/TextInput';

type LoginWithEmailProps = {
  email: string;
  newUser?: boolean;
  inviteCode?: string;
  onLogin: (token: string, user: CurrentUserDTO) => void;
};

const LoginWithEmail: React.FC<LoginWithEmailProps & ModalWithStepsProps> = ({
  email,
  newUser = false,
  inviteCode,
  onLogin,
  stepIndex,
  setStepIndex,
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
        title: newUser ? 'Create a new account' : 'Welcome back!',
        description: newUser
          ? 'First time? So glad you`ll be joining us 🤗 . Now create a password for your brand new account.'
          : 'Enter your password to login.',
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

  const [password, setPassword] = useState('');

  const login = async (code: string) => {
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
      setError('Incorrect password or code. Try again.');
    }
  };

  const identify = async () => {
    setOkEnabled(false);
    goForward();

    try {
      await ApiClient.getInstance().identifyWithEmail(
        email,
        password,
        inviteCode
      );
    } catch (err) {
      setStepIndex(0);
      setError(err.message);
      setOkEnabled(true);
    }
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (stepIndex == 0) {
      identify();
    }
  }, [onOkPressed]);

  return (
    <div>
      {stepIndex == 0 && (
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
              setError(null);

              const text = e.target.value;
              setPassword(text);
              setOkEnabled(!!isValidPassword(text));
            }}
          />
        </form>
      )}
      {stepIndex == 1 && (
        <DigitInput
          length={6}
          onEnter={(code: string) => {
            login(code);
          }}
        />
      )}
    </div>
  );
};

export default ModalWithSteps(LoginWithEmail);
