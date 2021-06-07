import { YouTubeVideo } from '@fanbase/shared';

import { Result } from '../Result';

export interface YouTubeService {
  getOwnUploads(
    accessToken: string,
    count?: number,
    playlist?: string,
    page?: string
  ): Promise<
    Result<{
      videos: YouTubeVideo[];
      count: number;
      playlist: string;
      nextPage: string;
    }>
  >;

  getVideo(id: string): Promise<Result<YouTubeVideo>>;
}
