import { Result } from '@fest/shared';
import { YouTubeChannel } from '../entities';
import { YouTubeVideo } from '@fest/shared';

export interface YouTubeService {
  getOwnChannel(accessToken: string): Promise<Result<YouTubeChannel>>;

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
