import { MediaService, YouTubeService } from '../../services';
import { Result, TokenType, WrappedError } from '@fest/shared';

import { CreateCommunity } from '../../usecases';
import { GetYouTubeChannel } from '../google/GetYouTubeChannel';
import { Token } from '../../entities';
import { TokenRepository } from '../../repositories';
import UseCase from '../../base/UseCase';
import UserRepository from '../../repositories/UserRepository';
import { generateTokenId } from '../../utils';

export interface CreateTokenInput {
  user: string;
  type: TokenType;
  resource?: string;
  name: string;
  description?: string;
  image?: string;
  supply: number;
  royaltyPct?: number;
  attributes?: {
    [name: string]: string;
  };
}
export type CreateTokenOutput = string;

export class CreateToken extends UseCase<CreateTokenInput, CreateTokenOutput> {
  private userRepository: UserRepository;
  private tokenRepository: TokenRepository;
  private mediaService: MediaService;
  private youtubeService: YouTubeService;
  private getYouTubeChannelUseCase: GetYouTubeChannel;
  private createCommunityUseCase: CreateCommunity;

  constructor(
    tokenRepository: TokenRepository,
    userRepository: UserRepository,
    mediaService: MediaService,
    youtubeService: YouTubeService,
    getYouTubeChannelUseCase: GetYouTubeChannel,
    createCommunityUseCase: CreateCommunity
  ) {
    super();

    this.tokenRepository = tokenRepository;
    this.userRepository = userRepository;
    this.mediaService = mediaService;
    this.youtubeService = youtubeService;
    this.getYouTubeChannelUseCase = getYouTubeChannelUseCase;
    this.createCommunityUseCase = createCommunityUseCase;
  }

  async exec(data: CreateTokenInput): Promise<Result<CreateTokenOutput>> {
    try {
      const user = await this.userRepository.get(data.user);
      if (!user) throw new Error('User not found.');
      if (!user.isCreator) throw new Error('User is not a creator.');

      const type = data.type || TokenType.BASIC;

      const { resource, name, description, supply, royaltyPct, attributes } =
        data;

      let { image } = data;

      let externalUrl;

      if (type == TokenType.YT_VIDEO) {
        if (!resource) return Result.fail();

        // Verify video belongs to the user's own channel
        const ytChannel = await this.getYouTubeChannelUseCase.exec({
          user: data.user
        });
        if (!ytChannel.success) return Result.fail();

        const ytVideo = await this.youtubeService.getVideo(resource);
        if (!ytVideo.success) throw ytVideo.error;

        if (ytChannel.data.id != ytVideo.data.channelId) return Result.fail();

        const imageResult = await this.mediaService.pipeFrom(
          MediaService.basePath.tokens,
          ytVideo.data.thumbnail
        );
        if (!imageResult.success)
          throw new WrappedError(imageResult.error, 'Could not get thumbnail.');

        image = imageResult.data;
        externalUrl = ytVideo.data.url;
      }

      let token = new Token({
        id: generateTokenId()(),
        creatorId: data.user,
        type,
        name,
        description,
        supply,
        image,
        externalUrl,
        royaltyPct: royaltyPct * 100,
        ...(attributes && Object.keys(attributes).length > 0 && { attributes })
      });

      token = await this.tokenRepository.create(token);
      await this.userRepository.addToken(data.user, token.id);

      await this.createCommunityUseCase.exec({
        name: data.name,
        creator: data.user,
        tokens: [token.id]
      });

      return Result.ok(token.id);
    } catch (err) {
      return Result.fail(err);
    }
  }
}
