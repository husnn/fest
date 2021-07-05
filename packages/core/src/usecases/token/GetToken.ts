import { TokenDTO } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { mapTokenToDTO } from '../../mappers';
import { TokenRepository } from '../../repositories';
import { Result } from '../../Result';

export interface GetTokenInput {
  id: string;
}

export interface GetTokenOutput {
  token: TokenDTO;
}

export class GetToken extends UseCase<GetTokenInput, GetTokenOutput> {
  private tokenRepository: TokenRepository;

  constructor(tokenRepository: TokenRepository) {
    super();

    this.tokenRepository = tokenRepository;
  }

  async exec(data: GetTokenInput): Promise<Result<GetTokenOutput>> {
    const token = await this.tokenRepository.get(data.id, [
      'creator',
      'creator.wallet'
    ]);

    return token ? Result.ok({ token: mapTokenToDTO(token) }) : Result.fail();
  }
}
