import { Button, FormInput, TextArea, TextInput } from '../ui';
import { Field, Form, Formik, FormikProps } from 'formik';
import { Global, css } from '@emotion/react';
import React, { useState } from 'react';
import { UserInfoSchema, isEmailAddress } from '@fest/shared';

import ApiClient from '../modules/api/ApiClient';
import { YouTubeButton } from '../components';
import Head from 'next/head';
import { fontSize } from '../styles/constants';
import { getProfileUrl } from '../utils';
import {
  saveCurrentUser,
  updateCurrentUser
} from '../modules/auth/authStorage';
import styled from '@emotion/styled';
import styles from '../styles/Settings.module.scss';
import useAuthentication from '../modules/auth/useAuthentication';
import { useRouter } from 'next/router';
import { AvatarUpload } from '../components/AvatarUpload';

const SettingsSheet = styled.div`
  max-width: 450px;
  margin: 0 auto;
  padding-bottom: 30px;
  display: flex;
  flex-direction: column;

  > * + * {
    margin-top: 50px;
  }
`;

const SettingsBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  > * + * {
    margin-top: 20px;
  }

  :first-of-type {
    margin-top: 20px;
  }
`;

const BlockHeader = styled.div`
  padding: 10px 0;
  > * + * {
    margin-top: 5px;
  }
`;

const BlockForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;

  > * + * {
    margin-top: 20px;
  }
`;

export default function SettingsPage() {
  const router = useRouter();

  const { currentUser, setCurrentUser, clearAuth } = useAuthentication(true);

  const [newEmail, setNewEmail] = useState(currentUser?.email || '');
  const [emailChangeError, setEmailChangeError] = useState();
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);

  return (
    <div className="container boxed">
      <Head>
        <title>Settings</title>
      </Head>
      {currentUser && (
        <SettingsSheet>
          <h1>Settings</h1>
          <SettingsBlock>
            <BlockHeader>
              <AvatarUpload
                onUpdate={(user) => {
                  setCurrentUser(updateCurrentUser(user));
                }}
              />
            </BlockHeader>
            <BlockHeader>
              <h2>Your info</h2>
            </BlockHeader>
            <Formik
              initialValues={{
                name: currentUser.name || '',
                username: currentUser.username || '',
                bio: currentUser.bio || ''
              }}
              validationSchema={UserInfoSchema}
              onSubmit={async (values, { setErrors }) => {
                const data = {};

                for (const key in values) {
                  const val = values[key];

                  if (val && val != currentUser[key]) {
                    data[key] = val;
                  }
                }

                try {
                  const response = await ApiClient.instance?.editUser(data);

                  setCurrentUser(response.user);
                  saveCurrentUser(response.user);

                  router.push(getProfileUrl(response.user));
                } catch (err) {
                  setErrors({ global: err.message });
                }
              }}
            >
              {({
                values,
                handleChange,
                isValid,
                dirty,
                errors,
                isSubmitting
              }: FormikProps<any>) => (
                <Form className={styles.userDetailsForm}>
                  <FormInput label="Display name" error={errors.name as string}>
                    <Field
                      id="name"
                      name="name"
                      placeholder="Bruce Wayne"
                      component={TextInput}
                      value={values.name}
                      onChange={handleChange}
                    />
                  </FormInput>

                  <FormInput label="Username" error={errors.username as string}>
                    <Field
                      id="username"
                      name="username"
                      placeholder="N00bMasterXX"
                      component={TextInput}
                      value={values.username}
                      onChange={handleChange}
                    />
                  </FormInput>

                  <FormInput label="Email address">
                    <Field
                      id="email"
                      name="email"
                      placeholder="bruce@wayne.inc"
                      component={TextInput}
                      value={currentUser.email || ''}
                      disabled={true}
                    />
                  </FormInput>

                  <FormInput label="Bio" error={errors.bio as string}>
                    <Field
                      type="bio"
                      id="bio"
                      placeholder="Tell us something about yourself..."
                      component={TextArea}
                      value={values.bio}
                      onChange={handleChange}
                    />
                  </FormInput>

                  {errors.global && (
                    <p className="form-error">{errors.global}</p>
                  )}

                  <Global
                    styles={css`
                      .form-error {
                        padding: 10px 20px;
                        color: red;
                        background-color: #ffcccb;
                        font-size: ${fontSize.sm};
                        border-radius: 10px;
                      }
                    `}
                  />

                  <Button
                    type="submit"
                    color="secondary"
                    loading={isSubmitting}
                    disabled={!dirty || !isValid}
                  >
                    Save Changes
                  </Button>
                </Form>
              )}
            </Formik>
          </SettingsBlock>

          <SettingsBlock>
            <BlockHeader>
              <h2>Change email address</h2>
              <p>
                {!emailChangeRequested
                  ? 'We will send a confirmation email to this address.'
                  : `An email has been sent to the address provided.
                  Follow the given instructions to confirm the change.`}
              </p>
            </BlockHeader>
            {!emailChangeRequested && (
              <BlockForm
                onSubmit={async (e) => {
                  e.preventDefault();
                  const requestedTimeout = setTimeout(
                    () => setEmailChangeRequested(true),
                    500
                  );

                  try {
                    await ApiClient.getInstance().requestEmailAddressChange(
                      newEmail
                    );
                  } catch (err) {
                    clearTimeout(requestedTimeout);
                    setEmailChangeRequested(false);
                    setEmailChangeError(err.message);
                    console.log(err);
                  }
                }}
              >
                <FormInput label="New email address" error={emailChangeError}>
                  <TextInput
                    type="email"
                    id="email"
                    placeholder="bruce@wayne.inc"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailChangeError(null);
                    }}
                  />
                </FormInput>
                <Button
                  type="submit"
                  size="small"
                  disabled={emailChangeRequested || !isEmailAddress(newEmail)}
                >
                  Change email
                </Button>
              </BlockForm>
            )}
          </SettingsBlock>

          <SettingsBlock>
            <BlockHeader>
              <h2>Change your password</h2>
              <p>
                You can change this by signing out and requesting a password
                reset.
              </p>
            </BlockHeader>
            <Button
              size="small"
              onClick={() => {
                clearAuth();
                router.push('/login');
              }}
            >
              Sign out
            </Button>
          </SettingsBlock>

          <SettingsBlock>
            <BlockHeader>
              <h2>Link YouTube channel</h2>
              <p>Sign in to turn your videos into tokens.</p>
            </BlockHeader>
            <YouTubeButton
              onLinkReceived={(link: string) => {
                router.push(link);
              }}
            />
          </SettingsBlock>
        </SettingsSheet>
      )}
    </div>
  );
}
