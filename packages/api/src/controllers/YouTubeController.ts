import { NextFunction, Request, Response } from 'express';

import {
  GetYouTubeUploads,
  GoogleService,
  OAuthRepository,
  YouTubeService
} from '@fest/core';
import { GetOwnUploadsResponse } from '@fest/shared';

import { HttpError, HttpResponse } from '../http';

class YouTubeController {
  private getYouTubeUploadsUseCase: GetYouTubeUploads;

  constructor(
    oAuthRepository: OAuthRepository,
    googleService: GoogleService,
    youTubeService: YouTubeService
  ) {
    this.getYouTubeUploadsUseCase = new GetYouTubeUploads(
      oAuthRepository,
      googleService,
      youTubeService
    );
  }

  async getOwnUploads(req: Request, res: Response, next: NextFunction) {
    try {
      const { count, playlist, page } = req.query;

      const result = await this.getYouTubeUploadsUseCase.exec({
        user: req.user,
        count: count as any,
        playlist: playlist as any,
        page: page as any
      });

      if (!result.success) throw new HttpError('Could not get video uploads.');

      return new HttpResponse<GetOwnUploadsResponse>(res, {
        videos: result.data.videos,
        count: result.data.count,
        playlist: result.data.playlist,
        nextPage: result.data.nextPage
      });
    } catch (err) {
      next(err);
    }
  }
}

export default YouTubeController;
