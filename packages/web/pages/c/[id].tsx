import { CommunityDTO, GetCommunityResponse } from '@fest/shared';
import { useEffect, useState } from 'react';

import { ApiClient } from '../../modules/api';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

export const CommunityPage = ({ title }: { title: string }) => {
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
      <NextSeo
        title={title || 'Community'}
        description={`Become part of ${title} by owning the token. This will give you access to exclusive content among other things.`}
      />
      <Head>
        <title>{community?.name || 'Community'}</title>
      </Head>
      <h2>{community?.name}</h2>
    </div>
  );
};

export async function getServerSideProps(ctx) {
  let res: GetCommunityResponse;
  try {
    res = await ApiClient.getInstance().getCommunity(ctx.query.id);
  } catch (err) {
    console.log(err);
  }

  return { props: { title: res ? res.body.name : '' } };
}

export default CommunityPage;
