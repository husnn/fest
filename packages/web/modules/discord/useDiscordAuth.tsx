import { useCallback, useEffect, useState } from 'react';

import ApiClient from '../api/ApiClient';

export const useDiscordAuth = (checkLink = true) => {
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    if (!checkLink) return;
    ApiClient.instance?.isDiscordLinked().then((linked) => setIsLinked(linked));
  }, [checkLink]);

  const unlink = useCallback(async () => {
    return ApiClient.instance?.unlinkDiscord().then(() => setIsLinked(false));
  }, [setIsLinked]);

  return { isLinked, unlink };
};

export default useDiscordAuth;
