import { useEffect, useState } from 'react';

import { YouTubeVideo } from '@fanbase/shared';

import ApiClient from '../api/ApiClient';

export const useYouTubeVideos = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);

  const [playlist, setPlaylist] = useState(null);
  const [nextPage, setNextPage] = useState(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setIsInitialLoad(false);
    loadVideos();
  }, []);

  const loadVideos = async () => {
    if (!isInitialLoad && !nextPage) return;

    const uploads = await ApiClient.instance?.getYouTubeUploads(
      playlist,
      nextPage
    );

    setVideos([...videos, ...uploads.videos]);

    setPlaylist(uploads.playlist);
    setNextPage(uploads.nextPage);
  };

  return {
    moreAvailable: !isInitialLoad && nextPage,
    videos,
    loadVideos
  };
};

export default useYouTubeVideos;
