/** @jsxImportSource @emotion/react */
import 'react-image-lightbox/style.css';

import { CommunityDTO, PostDTO, PostMedia } from '@fest/shared';
import React, { useEffect, useRef, useState } from 'react';
import { getDisplayName, getImageUrl, getProfileUrl } from '../utils';

import Lightbox from 'react-image-lightbox';
import { css } from '@emotion/react';
import moment from 'moment';
import router from 'next/router';
import styled from '@emotion/styled';
import MoreIcon from '../public/images/ic-more.svg';
import { Link } from '../ui';
import Modal from '../ui/Modal';
import { ApiClient } from '../modules/api';

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
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const DropdownButton = ({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <Link
      onClick={() => onClick()}
      thinner
      css={css`
        width: 100%;
        padding: 10px 15px;
        display: flex;
        align-items: center;
        border-radius: 10px;

        &:hover {
          background-color: #f5f5f5;
        }
      `}
    >
      {children}
    </Link>
  );
};

const Post = React.memo(
  ({
    data,
    showContextMenu,
    onShowContextMenu,
    hideCommunity,
    onCommunitySelect,
    onDelete
  }: {
    data: PostDTO;
    showContextMenu?: boolean;
    onShowContextMenu?: () => void;
    hideCommunity?: boolean;
    onCommunitySelect: (community: CommunityDTO) => void;
    onDelete: (id: string) => void;
  }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteModalShowing, setDeleteModalShowing] = useState(false);

    useEffect(() => {
      setTimeout(() => setDropdownOpen(showContextMenu), 100);
    }, [showContextMenu]);

    return (
      <div
        css={css`
          width: 500px;
          padding: 10px;
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
          white-space: pre-wrap;
          background-color: #fafafa;
          border-radius: 10px;

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
          <CommunityInformation
            onClick={() => onCommunitySelect(data.community)}
          >
            <img src="/images/ic-circle.png" />
            <p className="small">{data.community?.name}</p>
          </CommunityInformation>
        )}
        <Top>
          <div
            css={css`
              display: flex;
              align-items: center;
              cursor: pointer;

              > * + * {
                margin-left: 15px;
              }
            `}
          >
            <div
              css={css`
                width: 40px;
                height: 40px;
              `}
              className="avatar"
            />
            <Metadata onClick={() => router.push(getProfileUrl(data.user))}>
              <p>{getDisplayName(data.user)}</p>
              <p className="smaller" style={{ opacity: 0.7 }}>
                {moment(data.dateCreated).fromNow()}
              </p>
            </Metadata>
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              align-items: center;
            `}
          >
            <MoreIcon
              fill="#7a7a7a"
              height={15}
              css={css`
                cursor: pointer;
              `}
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                onShowContextMenu();
              }}
            />
            {dropdownOpen && (
              <div
                css={css`
                  width: 180px;
                  min-height: 20px;
                  padding: 10px 5px;
                  background-color: #fefefe;
                  position: absolute;
                  margin: 25px 50px 0 0;
                  box-shadow: 3px 3px 20px 2px rgba(0, 0, 0, 0.05);
                  border-radius: 10px;
                `}
              >
                <DropdownButton onClick={() => setDeleteModalShowing(true)}>
                  Delete
                </DropdownButton>
              </div>
            )}
          </div>
        </Top>
        {data.text && <Text>{data.text}</Text>}
        {data.media?.length > 0 && <Media content={data.media} />}
        {deleteModalShowing && (
          <Modal
            show={deleteModalShowing}
            title="Are you sure?"
            description="This post will be deleted."
            ok="Confirm"
            okEnabled={!deleting}
            onOkPressed={() => {
              setDeleting(true);

              ApiClient.getInstance()
                .deletePost(data.id)
                .then(() => {
                  setDeleteModalShowing(false);
                  onDelete(data.id);
                })
                .catch((err) => {
                  console.log(err);
                  setDeleting(false);
                });
            }}
            requestClose={() => setDeleteModalShowing(false)}
          />
        )}
      </div>
    );
  }
);

export default Post;
