import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import styled from '@emotion/styled';

import { GoogleButton } from '../components';
import useAuthentication from '../modules/auth/useAuthentication';
import { TextInput } from '../ui';

const SettingsSheet = styled.div`
  max-width: 500px;
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
`;

export default function SettingsPage () {
  const router = useRouter();

  const { currentUser } = useAuthentication();

  useEffect(() => {}, []);

  return (
    <div className="container settings">
      <SettingsSheet>
        <SettingsBlock>
          <h3>{currentUser?.email}</h3>
          <TextInput placeholder="Username" />
        </SettingsBlock>
        <SettingsBlock>
          <h3>Connect to YouTube</h3>
          <GoogleButton
            onLinkReceived={(link: string) => {
              router.push(link);
            }}
          />
        </SettingsBlock>
      </SettingsSheet>
    </div>
  );
}
