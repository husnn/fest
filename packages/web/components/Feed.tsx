/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from 'react';

import { ApiClient } from '../modules/api';
import Post from './Post';
import { PostDTO } from '@fanbase/shared';
import { css } from '@emotion/react';

const Feed = ({ community }: { community?: string }) => {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [cursor, setCursor] = useState<string>();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    ApiClient.getInstance()
      .getFeed(cursor)
      .then((res) => {
        setPosts(res.body);
        setCursor(res.cursor);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div css={css``}>
      {posts.map((p) => {
        if (community && p.communityId !== community) return null;
        return <Post key={p.id} data={p} />;
      })}
    </div>
  );
};

export default Feed;
