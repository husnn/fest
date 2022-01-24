import { Button } from './Button';
import React from 'react';
import { TokenDTO } from '@fest/shared';
import TokenGridItem from './TokenGridItem';
import styled from '@emotion/styled';

const CollectionGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 10px;
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
