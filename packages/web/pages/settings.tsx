import { Field, Form, Formik, FormikProps } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import * as Yup from 'yup';

import styled from '@emotion/styled';
import { USERNAME_REGEX } from '@fanbase/shared';

import { GoogleButton } from '../components';
import ApiClient from '../modules/api/ApiClient';
import useAuthentication from '../modules/auth/useAuthentication';
import styles from '../styles/Settings.module.scss';
import { Button, FormInput, TextInput } from '../ui';

const SettingsSheet = styled.div`
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const SettingsBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

  &:form {
    gap: 20px;
  }
`;

const UserInfoSchema = Yup.object().shape({
  name: Yup.string().label('Name').max(20),
  username: Yup.string()
    .label('Username')
    .matches(
      USERNAME_REGEX,
      'Username must be between 3 and 15 characters long.'
    ),
  email: Yup.string().email().label('Email address')
});

export default function SettingsPage() {
  const router = useRouter();

  const { currentUser } = useAuthentication();

  useEffect(() => {}, []);

  return (
    <div className={'boxed ' + styles.content}>
      {currentUser && (
        <SettingsSheet>
          <SettingsBlock>
            <FormInput label="Your public address">
              <h3 className="wallet-address">{currentUser.wallet?.address}</h3>
            </FormInput>
          </SettingsBlock>
          <SettingsBlock>
            <Formik
              initialValues={{
                name: currentUser.name || '',
                username: currentUser.username || '',
                email: currentUser.email || ''
              }}
              validationSchema={UserInfoSchema}
              onSubmit={async (values, { setErrors }) => {
                let data = {};

                for (const key in values) {
                  const val = values[key];

                  if (val && val != currentUser[key]) {
                    data[key] = val;
                  }
                }

                try {
                  const response = await ApiClient.instance?.editUser(data);
                } catch (err) {
                  if (err.error == 'ValidationError')
                    setErrors({ global: err.message });
                }
              }}
            >
              {({
                values,
                handleChange,
                isValid,
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

                  {errors.global && <p>{errors.global}</p>}

                  <Button type="submit" color="secondary">
                    Save Changes
                  </Button>
                </Form>
              )}
            </Formik>
          </SettingsBlock>
          <SettingsBlock>
            <h2>Connect to YouTube</h2>
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
