import {
  Percentage,
  TokenAttributes,
  TokenFee,
  TokenMetadata,
  TokenType
} from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { Token } from '../../entities';
import { TokenRepository } from '../../repositories';
import UserRepository from '../../repositories/UserRepository';
import { Result } from '../../Result';
import { IPFSService, MediaService, YouTubeService } from '../../services';
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
  attributes?: TokenAttributes;
}
export type CreateTokenOutput = string;

export class CreateToken extends UseCase<CreateTokenInput, CreateTokenOutput> {
  private userRepository: UserRepository;
  private tokenRepository: TokenRepository;
  private mediaService: MediaService;
  private metadataStore: IPFSService;
  private youtubeService: YouTubeService;
  private getYouTubeChannelUseCase: GetYouTubeChannel;

  constructor(
    tokenRepository: TokenRepository,
    userRepository: UserRepository,
    mediaService: MediaService,
    metadataStore: IPFSService,
    youtubeService: YouTubeService,
    getYouTubeChannelUseCase: GetYouTubeChannel
  ) {
    super();

    this.tokenRepository = tokenRepository;
    this.userRepository = userRepository;
    this.mediaService = mediaService;
    this.metadataStore = metadataStore;
    this.youtubeService = youtubeService;
    this.getYouTubeChannelUseCase = getYouTubeChannelUseCase;
  }

  async exec(data: CreateTokenInput): Promise<Result<CreateTokenOutput>> {
    const user = await this.userRepository.get(data.user);

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
        ytVideo.data.thumbnail
      );
      if (!imageResult.success) return Result.fail('Could not get thumbnail.');

      image = imageResult.data;
      externalUrl = ytVideo.data.url;
    }

    const metadata: TokenMetadata = {
      type,
      name,
      description,
      image,
      external_url: externalUrl,
      attributes
    };

    const pinResult = await this.metadataStore.saveJson(metadata);
    if (!pinResult.success) return Result.fail();

    const metadataUri = pinResult.data;

    const fees: TokenFee[] = [];

    if (royaltyPct && royaltyPct > 0 && royaltyPct <= 100) {
      fees.push([user.wallet.address, Percentage(royaltyPct)]);
    }

    let token = new Token({
      id: generateTokenId(),
      creatorId: data.user,
      type,
      name,
      description,
      supply,
      image,
      externalUrl,
      metadataUri,
      fees
    });

    token = await this.tokenRepository.create(token);

    await this.userRepository.addToken(data.user, token.id);

    return Result.ok(token.id);
  }
}
