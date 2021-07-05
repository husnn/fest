import { TokenAttributes, TokenFee, TokenMetadata, TokenType } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { Token } from '../../entities';
import { TokenRepository } from '../../repositories';
import UserRepository from '../../repositories/UserRepository';
import { Result } from '../../Result';
import { IPFSService } from '../../services';
import { generateTokenId } from '../../utils';

export interface CreateTokenInput {
  user: string;
  type: TokenType;
  resource?: string;
  name: string;
  description?: string;
  image?: string;
  supply: number;
  fees?: TokenFee[];
  attributes?: TokenAttributes;
}
export type CreateTokenOutput = string;

export class CreateToken extends UseCase<CreateTokenInput, CreateTokenOutput> {
  private userRepository: UserRepository;
  private tokenRepository: TokenRepository;
  private metadataStore: IPFSService;

  constructor(
    tokenRepository: TokenRepository,
    userRepository: UserRepository,
    metadataStore: IPFSService
  ) {
    super();

    this.tokenRepository = tokenRepository;
    this.userRepository = userRepository;
    this.metadataStore = metadataStore;
  }

  async exec(data: CreateTokenInput): Promise<Result<CreateTokenOutput>> {
    const type = data.type || TokenType.BASIC;

    const { resource, name, description, image, supply, fees, attributes } =
      data;

    const metadata: TokenMetadata = {
      type,
      name,
      description,
      image,
      ...(resource && {
        externalUrl: resource
      }),
      attributes
    };

    const pinResult = await this.metadataStore.saveJson(metadata);

    if (!pinResult.success) return Result.fail();

    if (type == TokenType.YT_VIDEO) {
      if (!resource) return Result.fail();
    }

    let token = new Token({
      id: generateTokenId(),
      creatorId: data.user,
      type,
      name,
      description,
      supply,
      image,
      externalUrl: resource,
      fees
    });

    token = await this.tokenRepository.create(token);

    await this.userRepository.addToken(data.user, token.id);

    return Result.ok(token.id);
  }
}
