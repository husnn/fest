/** @jsxImportSource @emotion/react */
import React, { useEffect, useRef, useState } from 'react';

import { ApiClient } from '../modules/api';
import Post from './Post';
import { PostDTO } from '@fanbase/shared';
import { css } from '@emotion/react';

const Feed = ({
  community,
  newPost
}: {
  community?: string;
  newPost?: PostDTO;
}) => {
  const [posts, setPosts] = useState<PostDTO[]>([]);

  const cursorRef = useRef<string>();

  const fetchPosts = () => {
    ApiClient.getInstance()
      .getFeed(cursorRef.current)
      .then((res) => {
        setPosts((posts) => [...posts, ...res.body]);
        if (res.cursor) cursorRef.current = res.cursor;
      })
      .catch((err) => console.log(err));
  };

  const loaderRef = useRef();

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };

    const observer = new IntersectionObserver(() => {
      fetchPosts();
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
  }, []);

  useEffect(() => {
    if (!newPost) return;
    setPosts((posts) => [newPost, ...posts]);
  }, [newPost]);

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        padding: 30px 10px;
        overflow-y: scroll;

        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      {posts.map((p) => {
        if (community && p.communityId !== community) return null;
        return <Post key={p.id} data={p} />;
      })}
      <div ref={loaderRef} />
    </div>
  );
};

export default Feed;
