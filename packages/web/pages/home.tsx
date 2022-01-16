/** @jsxImportSource @emotion/react */

import { CommunityDTO, PostDTO } from '@fanbase/shared';
import React, { useEffect, useState } from 'react';

import { ApiClient } from '../modules/api';
import { Button } from '../ui';
import Composer from '../components/Composer';
import Feed from '../components/Feed';
import Modal from '../ui/Modal';
import { css } from '@emotion/react';
import { getCurrentUser } from '../modules/auth/authStorage';
import useAuthentication from '../modules/auth/useAuthentication';
import usePagination from '../modules/api/usePagination';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  const { c } = router.query;

  const { currentUser } = useAuthentication(true);

  const [selected, setSelected] = useState<CommunityDTO>();
  const [creatingPost, setCreatingPost] = useState(false);

  const [newPost, setNewPost] = useState<PostDTO>();

  useEffect(() => {
    if (!getCurrentUser()) router.push('/');
  }, []);

  const { data: communities } = usePagination<CommunityDTO>(
    (count: number, page: number, ...args) =>
      ApiClient.getInstance().getCommunitiesForUser(...args, count, page),
    [currentUser?.id]
  );

  useEffect(() => {
    if (!communities) return;
    setSelected(communities.find((community) => community.id == (c as string)));
  }, [c, communities]);

  useEffect(() => {
    const evl = (e: KeyboardEvent) => {
      if (!creatingPost) {
        if (e.shiftKey && e.key === 'N') {
          e.preventDefault();
          setCreatingPost(true);
        }
      } else {
        if (e.key === 'Escape') {
          e.preventDefault();
          setCreatingPost(false);
        }
      }
    };

    window.addEventListener('keydown', evl);

    return () => {
      window.removeEventListener('keydown', evl);
    };
  }, [creatingPost]);

  return (
    <div
      css={css`
        height: 100vh;
        margin-top: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <Feed community={c as string} newPost={newPost} />
      <Modal
        show={creatingPost}
        requestClose={() => setCreatingPost(false)}
        zeroPadding
      >
        <Composer
          selected={selected}
          communities={communities}
          onSubmit={async (text, community) => {
            ApiClient.getInstance()
              .createPost({
                text,
                community
              })
              .then((res) => {
                setNewPost({ ...res.body, user: currentUser });
              })
              .catch((err) => {
                console.log(err);
              });

            setCreatingPost(false);
          }}
        />
      </Modal>
      <Button
        css={css`
          position: fixed;
          bottom: 5%;
          right: 8%;
        `}
        color="primary"
        onClick={() => (!creatingPost ? setCreatingPost(true) : null)}
      >
        Create post
      </Button>
    </div>
  );
};

export default HomePage;
