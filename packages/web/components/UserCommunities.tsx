import ApiClient from '../modules/api/ApiClient';
import { CommunityDTO } from '@fanbase/shared';
import React from 'react';
import usePagination from '../modules/api/usePagination';

type UserCommunitiesProps = {
  user: string;
  onCommunitySelected?: (community: CommunityDTO) => void;
};

const UserCommunities = ({
  user,
  onCommunitySelected
}: UserCommunitiesProps) => {
  const { data, loadMore, hasMore } = usePagination<CommunityDTO>(
    (count: number, page: number) =>
      ApiClient.instance.getCommunitiesForUser(user, count, page)
  );

  console.log(data);

  return <div></div>;
};

export default UserCommunities;
