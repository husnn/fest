import React, { useEffect } from 'react';

import { ApiClient } from '../../modules/api';
import { useRouter } from 'next/router';

const LinkDiscordPage = () => {
  const router = useRouter();

  const { code, guild_id: guildId, state } = router.query;

  useEffect(() => {
    if (!code) return;
    ApiClient.getInstance()
      .linkDiscord(code as string, guildId as string, state as string)
      .then((res) => router.push(res.redirect || '/'));
  }, [code]);

  return <></>;
};

export default LinkDiscordPage;
