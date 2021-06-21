import React from 'react';

import styled from '@emotion/styled';
import { Token } from '@fanbase/shared';

import { Button } from './Button';
import TokenGridItem from './TokenGridItem';

const CollectionGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;

  @media screen and (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

type TokenCollectionProps = {
  tokens: Token[];
  onLoadMore?: () => void;
  onTokenSelected?: (token: Token) => void;
};

const TokenCollection = ({
  tokens,
  onLoadMore,
  onTokenSelected
}: TokenCollectionProps) => {
  return (
    <div className="token-collection">
      <CollectionGrid>
        {tokens.map((token: Token, index: number) => (
          <TokenGridItem
            key={index}
            token={token}
            onClick={(token: Token) =>
              onTokenSelected ? onTokenSelected(token) : null
            }
          />
        ))}
      </CollectionGrid>
      {onLoadMore && (
        <Button
          size="small"
          style={{ margin: '20px 30px' }}
          onClick={() => onLoadMore()}
        >
          Load more
        </Button>
      )}
    </div>
  );
};

export default TokenCollection;
