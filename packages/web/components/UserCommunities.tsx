/** @jsxImportSource @emotion/react */

import ApiClient from '../modules/api/ApiClient';
import { CommunityDTO } from '@fanbase/shared';
import React from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import usePagination from '../modules/api/usePagination';

const Collection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 10px;
`;

type UserCommunitiesProps = {
  user: string;
  onCommunitySelected: (community: CommunityDTO) => void;
};

const UserCommunities = ({
  user,
  onCommunitySelected
}: UserCommunitiesProps) => {
  const { data, loadMore, hasMore } = usePagination<CommunityDTO>(
    (count: number, page: number) =>
      ApiClient.instance.getCommunitiesForUser(user, count, page)
  );

  const Card = ({ community }: { community: CommunityDTO }) => {
    return (
      <div
        css={css`
          padding: 20px;
          border: 1px #f5f5f5 solid;
          border-radius: 10px;
          cursor: pointer;
        `}
        onClick={() => onCommunitySelected(community)}
      >
        <h4>{community.name}</h4>
      </div>
    );
  };

  return (
    <Collection>
      {data.map((community, index) => (
        <Card key={index} community={community} />
      ))}
    </Collection>
  );
};

export default UserCommunities;
