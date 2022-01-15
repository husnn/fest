/** @jsxImportSource @emotion/react */
import { PostDTO } from '@fanbase/shared';
import React from 'react';
import { css } from '@emotion/react';

const Post = ({ data }: { data: PostDTO }) => {
  return (
    <div css={css``}>
      <p>{data.text}</p>
    </div>
  );
};

export default Post;
