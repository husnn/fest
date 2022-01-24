import React, { useEffect, useState } from 'react';

import { ApiClient } from '../../modules/api';
import { CommunityDTO } from '@fest/shared';
import Head from 'next/head';
import { useRouter } from 'next/router';

export const CommunityPage = () => {
  const router = useRouter();

  const { id } = router.query;
  const [community, setCommunity] = useState<CommunityDTO>();

  useEffect(() => {
    if (!id) return;

    ApiClient.getInstance()
      .getCommunity(id as string)
      .then((res) => {
        setCommunity(res.body);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  return (
    <div className="container">
      <Head>
        <title>{community?.name || 'Community'}</title>
      </Head>
      <h2>{community?.name}</h2>
    </div>
  );
};

export default CommunityPage;
