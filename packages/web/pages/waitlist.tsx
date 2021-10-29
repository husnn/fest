import * as Yup from 'yup';

import {
  Button,
  Checkbox,
  FormInput,
  Link,
  RadioGroup,
  RadioOption,
  TextInput
} from '../ui';
import React, { useEffect, useState } from 'react';

import { ApiClient } from '../modules/api';
import Confetti from 'react-confetti';
import Head from 'next/head';
import { WaitlistEntryType } from '@fanbase/shared';
import styled from '@emotion/styled';
import { useFormik } from 'formik';

const Box = styled.div`
  max-width: 450px;
  margin: 0 auto;

  > form {
    display: flex;
    flex-direction: column;

    > * + * {
      margin-top: 10px;
    }
  }
`;

const Header = styled.div`
  margin-bottom: 10px;
`;

const Error = styled.p`
  margin-top: 10px;
  color: red;
`;

const SuccessBox = styled.div`
  > * + * {
    margin-top: 30px;
  }
`;

export const JoinWaitlistSchema = Yup.object().shape({
  hasWallet: Yup.boolean(),
  socialMedia: Yup.string()
    .label('Social media link')
    .when('isCreator', {
      is: true,
      then: Yup.string().required('Enter a link to one of your social media.')
    }),
  emailAddress: Yup.string().email().label('Email address').required(),
  walletAddress: Yup.string()
    .label('Wallet address')
    .when('hasWallet', {
      is: true,
      then: Yup.string().required('Enter a wallet address')
    })
});

export const WaitlistPage = () => {
  const userTypeOptions: RadioOption[] = [
    { id: 'fan', label: 'Fan' },
    { id: 'creator', label: 'Creator' }
  ];

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  const [userType, setUserType] = useState<RadioOption>(userTypeOptions[0]);
  const [hasWallet, setHasWallet] = useState(false);

  const [hasJoined, setHasJoined] = useState(false);

  const isCreator = userType.id === 'creator';

  const {
    handleSubmit,
    values,
    errors,
    handleChange,
    setFieldValue,
    setFieldError
  } = useFormik({
    initialValues: {
      socialMedia: '',
      emailAddress: '',
      walletAddress: '',
      isCreator: false,
      hasWallet: false
    },
    validationSchema: JoinWaitlistSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      const entryType =
        userType.id === 'creator'
          ? WaitlistEntryType.CREATOR
          : WaitlistEntryType.NORMAL;

      ApiClient.getInstance()
        .joinWaitlist(
          entryType,
          values.emailAddress,
          hasWallet,
          values.walletAddress,
          values.socialMedia
        )
        .then((res) => {
          if (res.success) setHasJoined(true);
          window.scrollTo(0, 0);
        })
        .catch((err) => {
          setFieldError('global', err.message);
        });
    }
  });

  return (
    <div className="container boxed wider">
      <Head>
        <title>Waitlist</title>
      </Head>
      {hasJoined && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={500}
          confettiSource={{
            x: 0,
            y: 0,
            w: width,
            h: 0
          }}
          initialVelocityX={4}
          initialVelocityY={10}
          tweenDuration={5000}
          recycle={false}
        />
      )}
      <Box>
        {!hasJoined ? (
          <form onSubmit={handleSubmit}>
            <Header>
              <h1>Join the waitlist</h1>
              <p>Be one of the first people to get access.</p>
            </Header>
            <FormInput label="Are you a fan or creator?">
              <RadioGroup
                category="userType"
                options={userTypeOptions}
                selected={userType}
                onSelect={(option) => {
                  setUserType(option);
                  setFieldValue('isCreator', option.id === 'creator');
                }}
              />
            </FormInput>
            {isCreator && (
              <FormInput
                label="Social media"
                description="Established creators are more likely to be approved."
                error={errors.socialMedia}
              >
                <TextInput
                  name="socialMedia"
                  value={values.socialMedia}
                  onChange={handleChange}
                  placeholder="twitter.com/absolute-geezer"
                />
              </FormInput>
            )}
            <FormInput
              label="Your email address"
              description="We'll send you the invite code here."
              error={errors.emailAddress}
            >
              <TextInput
                name="emailAddress"
                type="email"
                value={values.emailAddress}
                placeholder="darth@vader.space"
                onChange={handleChange}
              />
            </FormInput>
            <FormInput label="Wallet information" optional>
              <Checkbox
                id="hasWallet"
                label="Add wallet address?"
                checked={hasWallet}
                onChange={() => {
                  setHasWallet(!hasWallet);
                  setFieldValue('hasWallet', !hasWallet);
                }}
              />
              {hasWallet && (
                <FormInput
                  description="Fanbase allows you to use your own wallet if you have one. Otherwise, we'll take care of it for you :)"
                  error={errors.walletAddress}
                >
                  <TextInput
                    name="walletAddress"
                    onChange={handleChange}
                    value={values.walletAddress}
                    placeholder="0x34...13bCa"
                  />
                </FormInput>
              )}
            </FormInput>
            {(errors as any).global && (
              <Error className="smaller">{(errors as any).global}</Error>
            )}
            <Button type="submit" color="primary" style={{ marginTop: 20 }}>
              Join Waitlist
            </Button>
          </form>
        ) : (
          <SuccessBox>
            <h1>Yay! Thank you for your interest 🥳</h1>
            <div style={{ marginTop: 20 }}>
              <h3>You&apos;re on our radar now</h3>
              <p>Keep an eye out for an email from us.</p>
            </div>
            <Link href="/" style={{ display: 'block' }}>
              <Button color="secondary" size="small">
                Return home
              </Button>
            </Link>
          </SuccessBox>
        )}
      </Box>
    </div>
  );
};

export default WaitlistPage;
