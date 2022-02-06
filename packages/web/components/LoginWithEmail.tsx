import { CurrentUserDTO, isValidPassword } from '@fest/shared';
import ModalWithSteps, { ModalWithStepsProps } from './ModalWithSteps';
import React, { useEffect, useRef, useState } from 'react';

import ApiClient from '../modules/api/ApiClient';
import ReactCodeInput from 'react-code-input';
import { Link } from '../ui';
import TextInput from '../ui/TextInput';
import styled from '@emotion/styled';

const PasswordResetText = styled.p`
  display: block;
  margin: 15px 0 5px;
  color: #9a9a9a;
`;

type LoginWithEmailProps = {
  email: string;
  newUser?: boolean;
  inviteCode?: string;
  onLogin: (token: string, expiry: number, user: CurrentUserDTO) => void;
  onPasswordReset: () => void;
};

const LoginWithEmail: React.FC<LoginWithEmailProps & ModalWithStepsProps> = ({
  email,
  newUser = false,
  inviteCode,
  onLogin,
  onPasswordReset,
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
      const { token, expiry, user } =
        await ApiClient.getInstance().loginWithEmail(email, password, code);

      onLogin(token, expiry, user);
      close();
    } catch (err) {
      setStepIndex(0);
      setError('Incorrect password or code. Try again.');
      setOkEnabled(true);
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

    if (stepIndex == 0 && isValidPassword(password)) {
      identify();
    }
  }, [onOkPressed]);

  const resettingPassword = useRef(false);

  const requestPasswordReset = () => {
    if (resettingPassword.current) return;
    resettingPassword.current = true;

    ApiClient.getInstance()
      .sendPasswordResetRequest(email)
      .then(() => onPasswordReset())
      .catch((err) => {
        resettingPassword.current = false;
        console.log(err);
      });
  };

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
            autoFocus
          />
          {!newUser && (
            <PasswordResetText className="small">
              Forgot password?{' '}
              <Link className="small" onClick={() => requestPasswordReset()}>
                Click here
              </Link>{' '}
              to reset.
            </PasswordResetText>
          )}
        </form>
      )}
      {stepIndex == 1 && (
        <ReactCodeInput
          name="authCode"
          inputMode="numeric"
          type="password"
          filterChars={['0-9']}
          fields={6}
          inputStyle={{
            width: 35,
            height: 35,
            marginLeft: 5,
            padding: '2px',
            fontSize: '16pt',
            textAlign: 'center'
          }}
          onChange={(value) => {
            if (value.length == 6) login(value);
          }}
        />
      )}
    </div>
  );
};

export default ModalWithSteps(LoginWithEmail);
