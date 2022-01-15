/** @jsxImportSource @emotion/react */
import { PostDTO } from '@fanbase/shared';
import React from 'react';
import { css } from '@emotion/react';
import { getDisplayName } from '../utils';
import moment from 'moment';
import styled from '@emotion/styled';

const Top = styled.div`
  padding: 10px 0;
  display: flex;
  align-items: center;

  > * + * {
    margin-left: 20px;
  }
`;

const Metadata = styled.div`
  display: flex;
  flex-direction: column;

  > * + * {
    margin-top: 5px;
  }
`;

const Text = styled.div``;

const Post = ({ data }: { data: PostDTO }) => {
  return (
    <div
      css={css`
        width: 95%;
        margin-bottom: 30px;
        padding: 30px 20px;
        display: flex;
        flex-direction: column;
        background-color: #fafafa;
        border-radius: 20px;

        > * + * {
          margin-top: 10px;
        }

        @media screen and (max-width: 500px) {
          width: 95%;
        }
      `}
    >
      <Top>
        <div
          css={css`
            width: 50px;
            height: 50px;
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
