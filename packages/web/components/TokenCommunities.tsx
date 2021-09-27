import { CommunityDTO } from '@fanbase/shared';
import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div``;

const Row = styled.div`
  padding: 30px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0px 5px 10px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
`;

type TokenCommunitiesProps = {
  communities: CommunityDTO[];
  onSelected: (community: CommunityDTO) => void;
};

export const TokenCommunities = ({
  communities,
  onSelected
}: TokenCommunitiesProps) => {
  return (
    <Container>
      {communities.map((community) => (
        <Row key={community.id} onClick={() => onSelected(community)}>
          <h3>{community.name}</h3>
        </Row>
      ))}
    </Container>
  );
};

export default TokenCommunities;
