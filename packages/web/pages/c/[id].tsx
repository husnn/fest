import { CommunityDTO } from '@fanbase/shared';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../modules/api';

export const CommunityPage = () => {
  const router = useRouter();

  const { id } = router.query;
  const [community, setCommunity] = useState<CommunityDTO>();

  useEffect(() => {
    if (!id) return;

    ApiClient.getInstance().getCommunity(id as string);
  }, [id]);

  return (
    <div className="container">
      <Head>
        <title>Community</title>
      </Head>
    </div>
  );
};

export default CommunityPage;
