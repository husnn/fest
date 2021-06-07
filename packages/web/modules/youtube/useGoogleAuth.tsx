import { useEffect, useState } from 'react';

import ApiClient from '../api/ApiClient';

export const useGoogleAuth = () => {
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    getAuthStatus();
  }, []);

  const unlink = async () => {
    await ApiClient.instance?.unlinkGoogle();
    setIsLinked(false);
  };

  const getAuthStatus = async () => {
    const linked = await ApiClient.instance?.isGoogleLinked();
    setIsLinked(linked);
  };

  const getLink = async () => {
    const link = await ApiClient.instance?.getGoogleOAuthLink();
    return link;
  };

  return { isLinked, getLink, unlink };
};

export default useGoogleAuth;
