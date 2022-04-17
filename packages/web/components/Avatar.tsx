/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { getImageUrl } from '../utils';
import { UserDTO } from '@fest/shared';

export const Avatar = React.memo(
  ({
    user,
    size = 50,
    className,
    style
  }: {
    user?: UserDTO;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }) => {
    const image = user?.avatar
      ? getImageUrl(user.avatar, { width: size })
      : null;

    return (
      <div
        css={css`
          width: ${size || 50}px;
          height: ${size || 50}px;

          background: ${image
            ? `url(${image})`
            : 'linear-gradient(to left, #a770ef, #cf8bf3, #fdb99b)'};

          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;

          border-radius: 50%;
        `}
        className={className}
        style={style}
      />
    );
  }
);
