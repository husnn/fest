/** @jsxImportSource @emotion/react */
import React, { useEffect, useRef, useState } from 'react';

import { ApiClient } from '../modules/api';
import Post from './Post';
import { PostDTO } from '@fest/shared';
import { css } from '@emotion/react';
import { getHomeUrl } from '../utils';
import router from 'next/router';
import InfiniteScroll from 'react-infinite-scroll-component';

const Feed = ({
  community,
  newPost
}: {
  community?: string;
  newPost?: PostDTO;
}) => {
  const [posts, setPosts] = useState<PostDTO[]>();
  const [cursor, setCursor] = useState<string>();

  const fetchPosts = () => {
    ApiClient.getInstance()
      .getFeed(cursor)
      .then((res) => {
        const allPosts = [...(posts || []), ...res.body];
        setPosts(allPosts);
        setPostLength(allPosts.length);
        setCursor(res.cursor);
      })
      .catch((err) => console.log(err));
  };

  const initialMount = useRef(true);

  useEffect(() => {
    if (!initialMount) return;
    fetchPosts();
    initialMount.current = false;
  }, []);

  useEffect(() => {
    if (!newPost) return;
    setPosts((posts) => [newPost, ...(posts || [])]);
    setPostLength(postLength + 1);
  }, [newPost]);

  const [contextMenuPostID, setContextMenuPostID] = useState<string>();

  useEffect(() => {
    const handleClick = () => setContextMenuPostID(null);
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [postLength, setPostLength] = useState(0);

  return posts ? (
    <InfiniteScroll
      css={css`
        padding: ${community ? '60px 10px 20px' : '20px 10px'};
      `}
      dataLength={postLength}
      next={fetchPosts}
      hasMore={!!cursor}
      loader={<h4>Loading...</h4>}
      endMessage={
        <p
          css={css`
            text-align: center;
            padding: 20px 0;
          `}
        >
          <b>You&apos;ve reached the end :)</b>
        </p>
      }
    >
      {posts.map((p, i) => {
        if (community && p.communityId !== community) return null;
        return (
          <Post
            key={p.id}
            data={p}
            showContextMenu={contextMenuPostID === p.id}
            onShowContextMenu={() => setContextMenuPostID(p.id)}
            hideCommunity={!!community}
            onCommunitySelect={(c) =>
              router.push(getHomeUrl(c), undefined, { shallow: true })
            }
            onDelete={() => {
              posts.splice(i, 1);
              setPosts(posts);
              setPostLength(posts.length);
            }}
          />
        );
      })}
    </InfiniteScroll>
  ) : null;
};

export default Feed;
