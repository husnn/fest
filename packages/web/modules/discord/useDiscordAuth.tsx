import { useCallback, useEffect, useState } from 'react';

import ApiClient from '../api/ApiClient';

export const useDiscordAuth = () => {
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    ApiClient.instance?.isDiscordLinked().then((linked) => setIsLinked(linked));
  }, []);

  const unlink = useCallback(async () => {
    return ApiClient.instance?.unlinkDiscord().then(() => setIsLinked(false));
  }, [setIsLinked]);

  return { isLinked, unlink };
};

export default useDiscordAuth;
