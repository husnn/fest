import React, { useEffect } from 'react';

import { ApiClient } from '../../modules/api';
import { settingsPageUrl } from '../../utils';
import { useRouter } from 'next/router';

const LinkDiscordPage = () => {
  const router = useRouter();

  const { code } = router.query;

  useEffect(() => {
    if (!code) return;
    ApiClient.getInstance()
      .linkDiscord(code as string)
      .then(() => router.push(settingsPageUrl));
  }, [code]);

  return <></>;
};

export default LinkDiscordPage;
