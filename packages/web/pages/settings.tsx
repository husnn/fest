import { Button, FormInput, TextArea, TextInput } from '../ui';
import { Field, Form, Formik, FormikProps } from 'formik';
import { Global, css } from '@emotion/react';

import ApiClient from '../modules/api/ApiClient';
import { GoogleButton } from '../components';
import Head from 'next/head';
import React from 'react';
import { UserInfoSchema } from '@fanbase/shared';
import { fontSize } from '../styles/constants';
import { getProfileUrl } from '../utils';
import { saveCurrentUser } from '../modules/auth/authStorage';
import styled from '@emotion/styled';
import styles from '../styles/Settings.module.scss';
import useAuthentication from '../modules/auth/useAuthentication';
import { useRouter } from 'next/router';

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

export default function SettingsPage() {
  const router = useRouter();

  const { currentUser, setCurrentUser } = useAuthentication(true);

  return (
    <div className="container boxed">
      <Head>
        <title>Settings</title>
      </Head>
      {currentUser && (
        <SettingsSheet>
          <h1>Settings</h1>
          {/* <SettingsBlock>
            <FormInput label="Your public address">
            <h3 className="wallet-address">{currentUser.wallet?.address}</h3>
            </FormInput>
          </SettingsBlock> */}
          <SettingsBlock>
            <BlockHeader>
              <h2>Your info</h2>
            </BlockHeader>
            <Formik
              initialValues={{
                name: currentUser.name || '',
                username: currentUser.username || '',
                email: currentUser.email || '',
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

                  <FormInput
                    label="Email address"
                    error={errors.email as string}
                  >
                    <Field
                      type="email"
                      id="email"
                      placeholder="bruce@wayne.inc"
                      component={TextInput}
                      value={values.email}
                      onChange={handleChange}
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
              <h2>Connect to YouTube</h2>
              <p>Sign in to turn your videos into tokens.</p>
            </BlockHeader>
            <GoogleButton
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
