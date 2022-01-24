/** @jsxImportSource @emotion/react */

import 'react-image-lightbox/style.css';

import { CommunityDTO, PostDTO, PostMedia } from '@fest/shared';
import React, { useState } from 'react';
import { getDisplayName, getImageUrl, getProfileUrl } from '../utils';

import Lightbox from 'react-image-lightbox';
import { css } from '@emotion/react';
import moment from 'moment';
import router from 'next/router';
import styled from '@emotion/styled';

const CommunityInformation = styled.div`
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

  @media screen and (max-width: 500px) {
    margin: 10px 5px 0;
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

const Text = styled.div`
  word-break: break-all;
`;

const Media = ({ content }: { content: PostMedia[] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  return (
    <div
      css={css`
        display: flex;
        width: 100%;
        overflow-x: scroll;
      `}
    >
      {content.map((m, i) => (
        <img
          css={css`
            width: ${content.length > 1 ? '90%' : '100%'};
            height: 300px;
            object-fit: cover;
            cursor: pointer;

            border-radius: 10px;

            &:not(:first-of-type) {
              margin-left: 20px;
            }

            @media screen and (max-width: 500px) {
              height: 250px;
            }
          `}
          key={i}
          src={getImageUrl(m.sourceUrl, { width: 500 })}
          onClick={() => {
            setCurrentMediaIndex(i);
            setLightboxOpen(true);
          }}
        />
      ))}
      {lightboxOpen && (
        <Lightbox
          mainSrc={content[currentMediaIndex].sourceUrl}
          nextSrc={content[(currentMediaIndex + 1) % content.length].sourceUrl}
          prevSrc={
            content[(currentMediaIndex + content.length - 1) % content.length]
              .sourceUrl
          }
          onCloseRequest={() => setLightboxOpen(false)}
          onMovePrevRequest={() =>
            setCurrentMediaIndex(
              (currentMediaIndex + content.length - 1) % content.length
            )
          }
          onMoveNextRequest={() =>
            setCurrentMediaIndex((currentMediaIndex + 1) % content.length)
          }
        />
      )}
    </div>
  );
};

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
          padding: 10px;
        }

        > * + * {
          margin-top: 5px;
        }

        @media screen and (max-width: 720px) {
          width: 500px;
        }

        @media screen and (max-width: 500px) {
          width: 100%;
          padding: 0 5px 10px;
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
      {data.media?.length > 0 && <Media content={data.media} />}
    </div>
  );
};

export default Post;
