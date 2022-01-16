/** @jsxImportSource @emotion/react */
import { CommunityDTO, PostDTO } from '@fanbase/shared';
import { getDisplayName, getProfileUrl } from '../utils';

import React from 'react';
import { css } from '@emotion/react';
import moment from 'moment';
import router from 'next/router';
import styled from '@emotion/styled';

const CommunityInformation = styled.div`
  padding: 10px 0;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border: 1px solid #f5f5f5;
  border-radius: 10px;
  cursor: pointer;

  img {
    width: 10px;
    height: 10px;
    margin: -2px 10px 0 0;
    opacity: 0.5;
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  > * + * {
    margin-left: 15px;
  }
`;

const Metadata = styled.div`
  display: flex;
  flex-direction: column;

  > * + * {
    margin-top: 4px;
  }
`;

const Text = styled.div``;

const Post = ({
  data,
  hideCommunity,
  onCommunitySelect
}: {
  data: PostDTO;
  hideCommunity?: boolean;
  onCommunitySelect: (community: CommunityDTO) => void;
}) => {
  return (
    <div
      css={css`
        width: 500px;
        padding: 10px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        white-space: pre-wrap;
        background-color: #fafafa;
        border-radius: 20px;

        > div {
          padding: 10px 20px;
        }

        > * + * {
          margin-top: 5px;
        }

        @media screen and (max-width: 720px) {
          width: 500px;
        }

        @media screen and (max-width: 500px) {
          width: 100%;
        }
      `}
    >
      {!hideCommunity && (
        <CommunityInformation onClick={() => onCommunitySelect(data.community)}>
          <img src="/images/ic-circle.png" />
          <p className="small">{data.community?.name}</p>
        </CommunityInformation>
      )}
      <Top onClick={() => router.push(getProfileUrl(data.user))}>
        <div
          css={css`
            width: 40px;
            height: 40px;
          `}
          className="avatar"
        />
        <Metadata>
          <p>{getDisplayName(data.user)}</p>
          <p className="smaller" style={{ opacity: 0.7 }}>
            {moment(data.dateCreated).fromNow()}
          </p>
        </Metadata>
      </Top>
      {data.text && <Text>{data.text}</Text>}
    </div>
  );
};

export default Post;
