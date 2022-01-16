export type MediaResolution = 'small' | 'regular' | 'high';

export type PostMedia = {
  variations?: Array<{
    resolution: MediaResolution;
    url: string;
  }>;
  sourceUrl: string;
  isVideo: boolean;
};
