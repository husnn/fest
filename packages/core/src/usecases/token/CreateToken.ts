import UseCase from '../../base/UseCase';
import { Token } from '../../entities';
import { TokenRepository } from '../../repositories';
import UserRepository from '../../repositories/UserRepository';
import { Result } from '../../Result';

export interface CreateTokenInput {
  user: string;
  supply: number;
  metadata: any;
}
export type CreateTokenOutput = string;

export class CreateToken extends UseCase<CreateTokenInput, CreateTokenOutput> {
  private userRepository: UserRepository;
  private tokenRepository: TokenRepository;

  constructor(
    tokenRepository: TokenRepository,
    userRepository: UserRepository
  ) {
    super();

    this.tokenRepository = tokenRepository;
    this.userRepository = userRepository;
  }

  async exec(data: CreateTokenInput): Promise<Result<CreateTokenOutput>> {
    let token = new Token({
      creatorId: data.user,
      supply: data.supply
    });

    token = await this.tokenRepository.create(token);

    await this.userRepository.addToken(data.user, token.id);

    return Result.ok(token.id);
  }
}
