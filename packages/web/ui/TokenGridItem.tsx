import React from 'react';

import styled from '@emotion/styled';
import { TokenDTO } from '@fanbase/shared';

import { getDisplayName, getImageUrl } from '../utils';

const GridItem = styled.div`
  width: 100%;
  // height: 320px;
  padding: 20px 10px;

  text-align: center;

  display: grid;
  grid-template-rows: 3fr fit-content(2fr);

  border: 1px solid #eee;
  border-radius: 20px;

  cursor: pointer;

  transition: 300ms all;

  overflow: hidden;

  &:hover {
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Preview = styled.div`
  width: 100%;
  height: 200px;

  background: url(/images/ic-token.svg) #f5f5f5;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 50%;

  border-radius: 20px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 100%;
    border-radius: 20px;
  }
`;

const TokenInfo = styled.div`
  width: 100%;
  padding: 10px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  text-align: left;

  h4 {
    margin-top: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .exclusive {
    font-weight: 700;
    background: linear-gradient(to right, #30cfd0 0%, #330867 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  > * + * {
    margin-top: 10px;
  }
`;

const Creator = styled.div`
  width: 100%;
  margin-top: 10px;
  display: flex;
  align-items: center;

  .avatar {
    width: 30px;
    height: 30px;
  }

  > * + * {
    margin-left: 10px;
  }
`;

const TokenGridItem = ({
  token,
  onClick
}: {
  token: TokenDTO;
  onClick?: (token: TokenDTO) => void;
}) => {
  const isExclusive = token.supply == 1;

  return (
    <GridItem onClick={() => (onClick ? onClick(token) : null)}>
      <Preview>
        {token.image && (
          <img src={getImageUrl(token.image, { width: 250, height: 250 })} />
        )}
      </Preview>
      <TokenInfo>
        <p className={`small ${isExclusive ? ' exclusive' : ''}`}>
          {isExclusive ? 'Exclusive' : `1 / ${token.supply}`}
        </p>
        <h4>{token.name}</h4>
        {/* <p className="small">{token.description}</p> */}
        {token.creator && (
          <Creator>
            {/* <img className="avatar" /> */}
            <p className="small">by {getDisplayName(token.creator)}</p>
          </Creator>
        )}
      </TokenInfo>
    </GridItem>
  );
};

export default TokenGridItem;
