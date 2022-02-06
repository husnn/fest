/** @jsxImportSource @emotion/react */
import React, { useEffect, useRef, useState } from 'react';

import { ApiClient } from '../modules/api';
import Post from './Post';
import { PostDTO } from '@fest/shared';
import { css } from '@emotion/react';
import { getHomeUrl } from '../utils';
import router from 'next/router';

const Feed = ({
  community,
  newPost
}: {
  community?: string;
  newPost?: PostDTO;
}) => {
  const [posts, setPosts] = useState<PostDTO[]>();

  const cursorRef = useRef<string>();

  const fetchPosts = () => {
    ApiClient.getInstance()
      .getFeed(cursorRef.current)
      .then((res) => {
        setPosts((posts) => [...(posts || []), ...res.body]);
        if (res.cursor) cursorRef.current = res.cursor;
      })
      .catch((err) => console.log(err));
  };

  const loaderRef = useRef();

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '10px',
      threshold: 1.0
    };

    const observer = new IntersectionObserver(() => {
      fetchPosts();
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    fetchPosts();
  }, []);

  useEffect(() => {
    if (!newPost) return;
    setPosts((posts) => [newPost, ...(posts || [])]);
  }, [newPost]);

  return posts ? (
    posts.length > 0 ? (
      <div
        css={css`
          width: 100%;
          height: 100%;
          padding: ${community ? '60px' : '20px'} 10px;
          overflow-y: scroll;

          display: flex;
          flex-direction: column;
          align-items: center;
        `}
      >
        {posts.map((p) => {
          if (community && p.communityId !== community) return null;
          return (
            <Post
              key={p.id}
              data={p}
              hideCommunity={!!community}
              onCommunitySelect={(c) =>
                router.push(getHomeUrl(c), undefined, { shallow: true })
              }
            />
          );
        })}
        <div
          css={css`
            margin: 20px 0 80px;
          `}
          ref={loaderRef}
        >
          {loaderRef && `You've reached the end :)`}
        </div>
      </div>
    ) : (
      <div
        css={css`
          width: 100%;
          margin: 100px auto 0;
          padding: 20px;
          text-align: center;

          display: flex;
          flex-direction: column;
          align-items: center;

          > * + * {
            margin-top: 30px;
          }
        `}
      >
        <p style={{ opacity: 0.5 }}>No posts to show.</p>
        <img src="/images/ill-no-comment.png" width={100} />
        <p
          css={css`
            padding: 20px 30px;
            background-color: #fafafa;
            border-radius: 20px;
            box-shadow: 3px 5px 10px 2px rgba(0, 0, 0, 0.05);
            opacity: 0.7;

            > * + * {
              margin-top: 50px;
            }
          `}
        >
          Join some communities
          <br />
          to see stuff here.
        </p>
      </div>
    )
  ) : null;
};

export default Feed;
