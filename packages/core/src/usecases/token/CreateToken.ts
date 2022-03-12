import { TokenType } from '@fest/shared';
import UseCase from '../../base/UseCase';
import { Token } from '../../entities';
import { TokenRepository } from '../../repositories';
import UserRepository from '../../repositories/UserRepository';
import { Result } from '../../Result';
import { MediaService, YouTubeService } from '../../services';
import { CreateCommunity } from '../../usecases';
import { generateTokenId } from '../../utils';
import { GetYouTubeChannel } from '../google/GetYouTubeChannel';

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
    const user = await this.userRepository.get(data.user);
    if (!user) return Result.fail('User not found.');
    if (!user.isCreator) return Result.fail('User is not a creator.');

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
      if (!ytVideo.success) return Result.fail();

      if (ytChannel.data.id != ytVideo.data.channelId) return Result.fail();

      const imageResult = await this.mediaService.pipeFrom(
        MediaService.basePath.tokens,
        ytVideo.data.thumbnail
      );
      if (!imageResult.success) return Result.fail('Could not get thumbnail.');

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
  }
}
