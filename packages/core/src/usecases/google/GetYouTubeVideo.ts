import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';
import { YouTubeService } from '../../services';
import { YouTubeVideo } from '@fest/shared';

export interface GetYouTubeVideoInput {
  id: string;
}
export type GetYouTubeVideoOutput = YouTubeVideo;

export class GetYouTubeVideo extends UseCase<
  GetYouTubeVideoInput,
  GetYouTubeVideoOutput
> {
  private youTubeService: YouTubeService;

  constructor(youTubeService: YouTubeService) {
    super();

    this.youTubeService = youTubeService;
  }

  async exec(
    data: GetYouTubeVideoInput
  ): Promise<Result<GetYouTubeVideoOutput>> {
    const result = await this.youTubeService.getVideo(data.id);
    return result.success ? Result.ok(result.data) : Result.fail();
  }
}
