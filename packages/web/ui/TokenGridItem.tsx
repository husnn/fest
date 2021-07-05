import React from 'react';

import styled from '@emotion/styled';
import { TokenDTO } from '@fanbase/shared';

const GridItem = styled.div`
  width: 100%;
  max-width: 180px;
  min-height: 200px;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }
`;

const Preview = styled.div`
  width: 120px;
  height: 120px;
  background-image: url('/images/ic-token.svg');
  background-size: 70%;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #f5f5f5;
  border-radius: 50%;
`;

const TokenInfo = styled.div`
  margin-top: 10px;
  padding: 0 10px;

  > * + * {
    margin-top: 5px;
  }
`;

const TokenGridItem = ({
  token,
  onClick
}: {
  token: TokenDTO;
  onClick?: (token: TokenDTO) => void;
}) => {
  return (
    <GridItem onClick={() => (onClick ? onClick(token) : null)}>
      <Preview />
      <TokenInfo>
        <h4>{token.name}</h4>
        <p>{token.description}</p>
      </TokenInfo>
    </GridItem>
  );
};

export default TokenGridItem;
