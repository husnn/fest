import React from 'react';

import styled from '@emotion/styled';
import { TokenDTO } from '@fanbase/shared';

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

  @media screen and (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

type TokenCollectionProps = {
  tokens: TokenDTO[];
  onLoadMore?: () => void;
  onTokenSelected?: (token: TokenDTO) => void;
};

const TokenCollection = ({
  tokens,
  onLoadMore,
  onTokenSelected
}: TokenCollectionProps) => {
  return (
    <div className="token-collection">
      <CollectionGrid>
        {tokens.map((token: TokenDTO, index: number) => (
          <TokenGridItem
            key={index}
            token={token}
            onClick={(token: TokenDTO) =>
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
