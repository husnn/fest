/** @jsxImportSource @emotion/react */

import { CommunityDTO } from '@fest/shared';
import React from 'react';
import { css } from '@emotion/react';
import { getHomeUrl } from '../utils';
import router from 'next/router';

export const CommunityHeader = ({ community }: { community: CommunityDTO }) => {
  return (
    <div
      css={css`
        width: 100%;
        background-color: #f5f5f5;
      `}
    >
      <div
        css={css`
          max-width: 600px;
          margin: 0 auto;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          background-color: #f5f5f5;
        `}
      >
        <div
          css={css`
            display: flex;
            cursor: pointer;

            > p {
              margin-top: 2px;
            }

            > * + * {
              margin-left: 10px;
            }
          `}
          onClick={() =>
            router.push(getHomeUrl(), undefined, { shallow: true })
          }
        >
          <img src="images/ic-back.svg" width={12} />
          <p className="small">{community?.name}</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityHeader;
