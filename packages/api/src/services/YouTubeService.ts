import Axios from 'axios';

import { Result, YouTubeService as IYouTubeService } from '@fanbase/core';
import { YouTubeVideo } from '@fanbase/shared';

export interface YouTubeConfig {
  apiKey: string;
}

class YouTubeService implements IYouTubeService {
  private config: YouTubeConfig;

  constructor (config: YouTubeConfig) {
    this.config = config;
  }

  static MapToVideo (data: any): YouTubeVideo {
    return {
      id: data.snippet.resourceId.videoId,
      datePublished: data.snippet.publishedAt,
      thumbnail: data.snippet.thumbnails.standard.url,
      title: data.snippet.title,
      description: data.snippet.description
    };
  }

  async getOwnChannel (accessToken: string): Promise<Result<any>> {
    const response = await Axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          access_token: accessToken,
          part: 'contentDetails',
          mine: true
        }
      }
    );

    return Result.ok(response.data.items[0]);
  }

  // async getUploadPlaylist(channel: string): Promise<
  //   Result<{
  //     id: string;
  //   }>
  // > {
  //   const response = await Axios.get(
  //     "https://www.googleapis.com/youtube/v3/playlists",
  //     {
  //       params: {
  //         key: this.config.apiKey,
  //         part: "contentDetails",
  //         channelId: channel,
  //       },
  //     }
  //   );

  //   const { uploads } = response.data.contentDetails.relatedPlaylists;

  //   return Result.ok({ id: uploads });
  // }

  async getOwnUploadPlaylist (accessToken: string): Promise<Result<string>> {
    const ownChannelResult = await this.getOwnChannel(accessToken);
    if (!ownChannelResult.success) return Result.fail();

    const uploadPlaylist =
      ownChannelResult.data.contentDetails.relatedPlaylists.uploads;

    return uploadPlaylist ? Result.ok(uploadPlaylist) : Result.fail();
  }

  async getPlaylistVideos (
    playlist: string,
    page?: string,
    count = 10
  ): Promise<
    Result<{
      videos: YouTubeVideo[];
      count: number;
      playlist: string;
      nextPage: string;
    }>
  > {
    const response = await Axios.get(
      'https://www.googleapis.com/youtube/v3/playlistItems',
      {
        params: {
          key: this.config.apiKey,
          part: 'snippet',
          playlistId: playlist,
          maxResults: count,
          pageToken: page
        }
      }
    );

    const { items, nextPageToken: nextPage } = response.data;

    const videos = items.map((item: any) => YouTubeService.MapToVideo(item));

    return Result.ok({
      videos,
      playlist,
      count,
      nextPage
    });
  }

  async getOwnUploads (
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
  > {
    if (!playlist) {
      const result = await this.getOwnUploadPlaylist(accessToken);
      playlist = result.success ? result.data : null;
    }

    if (!playlist) return Result.fail();

    const playlistVideosResult = await this.getPlaylistVideos(
      playlist,
      page,
      count
    );

    return playlistVideosResult.success
      ? Result.ok(playlistVideosResult.data)
      : Result.fail();
  }

  async getVideo (id: string): Promise<Result<YouTubeVideo>> {
    const response = await Axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          key: this.config.apiKey,
          part: 'snippet',
          id
        }
      }
    );

    const video = YouTubeService.MapToVideo(response.data);

    return Result.ok(video);
  }
}

export default YouTubeService;
