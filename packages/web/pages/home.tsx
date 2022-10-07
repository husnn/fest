/** @jsxImportSource @emotion/react */

import { CommunityDTO, PostDTO } from '@fest/shared';
import { useEffect, useState } from 'react';

import { ApiClient } from '../modules/api';
import { Button } from '../ui';
import CommunityHeader from '../components/CommunityHeader';
import Composer from '../components/Composer';
import Feed from '../components/Feed';
import Head from 'next/head';
import Modal from '../ui/Modal';
import { NextSeo } from 'next-seo';
import { css } from '@emotion/react';
import { getCurrentUser } from '../modules/auth/authStorage';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import usePagination from '../modules/api/usePagination';
import { useRouter } from 'next/router';

const HomePage = () => {
  useHeader();

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
      <NextSeo
        title="Home"
        description="Activity feed of exclusive content from your favourite creators and fellow community members."
      />
      <Head>
        <title>{selected ? selected.name : 'Home'}</title>
      </Head>
      {selected && <CommunityHeader community={selected} />}
      <Feed community={c as string} newPost={newPost} />
      <Modal
        show={creatingPost}
        requestClose={() => setCreatingPost(false)}
        zeroPadding
      >
        <Composer
          selected={selected}
          communities={communities}
          onSubmit={async (text, media, community) => {
            setCreatingPost(false);

            try {
              const res = await ApiClient.getInstance().getPostMediaUploadURLs(
                media.map((m) => {
                  return {
                    name: m.name,
                    type: m.type,
                    size: m.size
                  };
                })
              );

              for (const i in res.body) {
                await ApiClient.instance.uploadImageToS3(
                  res.body[i].signedUrl,
                  media[i]
                );
              }

              ApiClient.getInstance()
                .createPost({
                  text,
                  media: res.body.map((m) => m.url),
                  community
                })
                .then((res) => {
                  setNewPost({
                    ...res.body,
                    user: currentUser,
                    community: communities.find((c) => c.id === community)
                  });
                })
                .catch((err) => {
                  console.log(err);
                });
            } catch (err) {
              console.log(err);
            }
          }}
        />
      </Modal>
      {communities?.length > 0 && (
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
      )}
    </div>
  );
};

export default HomePage;
