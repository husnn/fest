import { YouTubeService as IYouTubeService, YouTubeChannel } from '@fest/core';
import { Result, YouTubeVideo } from '@fest/shared';

import Axios from 'axios';

export interface YouTubeConfig {
  apiKey: string;
}

class YouTubeService implements IYouTubeService {
  private config: YouTubeConfig;

  constructor(config: YouTubeConfig) {
    this.config = config;
  }

  static getHighestQualityThumbnail(thumbnails: any): { url: string } {
    return (
      thumbnails.maxres ||
      thumbnails.standard ||
      thumbnails.high ||
      thumbnails.medium ||
      thumbnails.default
    );
  }

  static MapToVideo(data: any): YouTubeVideo {
    const thumbnail = this.getHighestQualityThumbnail(data.snippet.thumbnails);

    return {
      id: data.id,
      datePublished: data.snippet.publishedAt,
      channelId: data.snippet.channelId,
      thumbnail: thumbnail.url,
      title: data.snippet.title,
      description: data.snippet.description,
      url: `https://www.youtube.com/watch?v=${data.id}`
    };
  }

  static MapPlaylistItemToVideo(data: any): YouTubeVideo {
    return {
      id: data.snippet.resourceId.videoId,
      datePublished: data.snippet.publishedAt,
      channelId: data.snippet.channelId,
      thumbnail: data.snippet.thumbnails.default.url,
      title: data.snippet.title,
      description: data.snippet.description,
      url: `https://www.youtube.com/watch?v=${data.snippet.resourceId.videoId}`
    };
  }

  async getOwnChannel(accessToken: string): Promise<Result<YouTubeChannel>> {
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

    return Result.ok(new YouTubeChannel(response.data.items[0]));
  }

  async getOwnUploadPlaylist(accessToken: string): Promise<Result<string>> {
    const ownChannelResult = await this.getOwnChannel(accessToken);
    if (!ownChannelResult.success) return Result.fail();

    const uploadPlaylist =
      ownChannelResult.data.contentDetails.relatedPlaylists['uploads'];

    return uploadPlaylist ? Result.ok(uploadPlaylist) : Result.fail();
  }

  async getPlaylistVideos(
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

    const videos = items.map((item: any) =>
      YouTubeService.MapPlaylistItemToVideo(item)
    );

    return Result.ok({
      videos,
      playlist,
      count,
      nextPage
    });
  }

  async getOwnUploads(
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

  async getVideo(id: string): Promise<Result<YouTubeVideo>> {
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

    const video = YouTubeService.MapToVideo(response.data.items[0]);

    return Result.ok(video);
  }
}

export default YouTubeService;
