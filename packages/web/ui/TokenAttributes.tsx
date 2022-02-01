/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';

const Tag = ({ attribute }: { attribute: string }) => {
  return (
    <p
      css={css`
        padding: 5px 20px;
        background-color: #fff;
        color: #0a0a0a;
        border: 1px solid #0a0a0a;
        border-radius: 15px;
      `}
    >
      {attribute}
    </p>
  );
};

const TokenAttributes = ({ attrs }: { attrs: Record<string, string> }) => {
  return (
    <div
      css={css`
        display: flex;

        > * + * {
          margin-left: 10px;
        }
      `}
    >
      {Object.entries(attrs).map(([key, value]) => {
        return <Tag key={key} attribute={value} />;
      })}
    </div>
  );
};

export default TokenAttributes;
