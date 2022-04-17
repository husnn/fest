import React, { useRef } from 'react';

import styled from '@emotion/styled';
import { ApiClient } from '../modules/api';
import { UserDTO } from '@fest/shared';
import { Avatar } from './Avatar';
import useAuthentication from '../modules/auth/useAuthentication';

const AvatarContainer = styled.div`
  width: 130px;
  height: 130px;
  margin-left: -10px;

  background: #f5f5f5;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 300ms;

  &:hover {
    background: #eee;
  }
`;

const AvatarInner = styled.div<{ image?: string }>`
  width: 120px;
  height: 120px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  > img {
    position: absolute;
    filter: invert(1);
    opacity: 0;
    transition: opacity 300ms;
  }

  &:hover {
    > img {
      opacity: 1;
    }
  }
`;

export const AvatarUpload = ({
  onUpdate
}: {
  onUpdate: (user: UserDTO) => void;
}) => {
  const { currentUser } = useAuthentication();

  const avatarUploadRef = useRef(null);

  const onSelect = (e) => {
    const files = e.target.files;
    if (files.length < 1) return;

    const fd = new FormData();

    fd.append('avatar', files[0]);

    ApiClient.getInstance()
      .updateAvatar(fd)
      .then((res) => onUpdate(res.user))
      .catch((err) => console.log(err));
  };

  return (
    <AvatarContainer>
      <input
        type="file"
        ref={avatarUploadRef}
        onChange={onSelect}
        accept="image/jpeg, image/png"
        style={{ display: 'none' }}
      />
      <AvatarInner onClick={() => avatarUploadRef.current.click()}>
        <Avatar user={currentUser} size={120} />
        <img src="images/ic-upload.svg" width={25} />
      </AvatarInner>
    </AvatarContainer>
  );
};
