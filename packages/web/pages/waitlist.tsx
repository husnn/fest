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
import {
  isEmailAddress,
  isValidURL,
  URL_REGEX,
  WaitlistEntryType
} from '@fest/shared';
import { getProfileUrl } from '../utils';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import useAuthentication from '../modules/auth/useAuthentication';
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

const FastTrackNote = styled.div`
  margin: -20px -15px 0;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 10px;
`;

export const JoinWaitlistSchema = Yup.object().shape({
  hasWallet: Yup.boolean(),
  socialMedia: Yup.string()
    .label('Social media link')
    .when('isCreator', {
      is: true,
      then: Yup.string()
        .matches(URL_REGEX, "This link doesn't look quite right...")
        .required('Enter a link to one of your social media.')
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
    { id: 'creator', label: 'Creator' },
    { id: 'fan', label: 'Fan' }
  ];

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const router = useRouter();

  const { currentUser } = useAuthentication();

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    if (currentUser) router.push(getProfileUrl(currentUser));
  }, [currentUser]);

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
      isCreator: isCreator,
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
              <h1>Get early access</h1>
              <p>Join the waitlist and get a head start 🚀</p>
            </Header>

            {router.query.ft == 'true' ||
              (router.query.ft == '1' && (
                <FastTrackNote>
                  <p>🎉 Your application will be fast-tracked</p>
                </FastTrackNote>
              ))}

            <FormInput label="Sign up as a">
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

            <FormInput label="Your email address" error={errors.emailAddress}>
              <TextInput
                name="emailAddress"
                type="email"
                value={values.emailAddress}
                placeholder="darth@vader.space"
                onChange={handleChange}
              />
            </FormInput>

            {isCreator && isEmailAddress(values.emailAddress) && (
              <FormInput label="Social media" error={errors.socialMedia}>
                <TextInput
                  name="socialMedia"
                  value={values.socialMedia}
                  onChange={handleChange}
                  placeholder="tiktok.com/@khaby.lame"
                />
              </FormInput>
            )}

            {isEmailAddress(values.emailAddress) &&
              (isCreator ? isValidURL(values.socialMedia) : true) && (
                <FormInput>
                  <Checkbox
                    id="hasWallet"
                    label="I have a crypto wallet"
                    checked={hasWallet}
                    onChange={() => {
                      setHasWallet(!hasWallet);
                      setFieldValue('hasWallet', !hasWallet);
                    }}
                  />
                  {hasWallet && (
                    <FormInput
                      description="Fest allows you to use your own wallet if you have one. Otherwise, we'll create one for you."
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
              )}

            {(errors as any).global && (
              <Error className="smaller">{(errors as any).global}</Error>
            )}

            <Button type="submit" color="primary" style={{ marginTop: 30 }}>
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
