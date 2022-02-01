import { useEffect, useState } from 'react';

import { YouTubeVideo } from '@fest/shared';

import ApiClient from '../api/ApiClient';

export const useYouTubeVideos = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);

  const [playlist, setPlaylist] = useState(null);
  const [nextPage, setNextPage] = useState(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [error, setError] = useState<string>();

  useEffect(() => {
    setIsInitialLoad(false);
    loadVideos();
  }, []);

  const loadVideos = () => {
    if (!isInitialLoad && !nextPage) return;

    return ApiClient.getInstance()
      .getYouTubeUploads(playlist, nextPage)
      .then((res) => {
        setVideos([...videos, ...res.videos]);
        setPlaylist(res.playlist);
        setNextPage(res.nextPage);
      })
      .catch((err) => {
        setError(err);
        console.log(err);
      });
  };

  return {
    moreAvailable: !isInitialLoad && nextPage,
    videos,
    loadVideos,
    error
  };
};

export default useYouTubeVideos;
