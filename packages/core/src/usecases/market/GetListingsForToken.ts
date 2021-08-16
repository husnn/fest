import { TokenListingDTO } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { TokenRepository } from '../../repositories';
import Result from '../../Result';

type GetListingsForTokenInput = {};
type GetListingsForTokenOutput = TokenListingDTO[];

export class GetListingsForToken extends UseCase<
  GetListingsForTokenInput,
  GetListingsForTokenOutput
> {
  private tokenRepository: TokenRepository;

  constructor(tokenRepository: TokenRepository) {
    super();

    this.tokenRepository = tokenRepository;
  }

  exec(
    data: GetListingsForTokenInput
  ): Promise<Result<GetListingsForTokenOutput>> {
    throw new Error('Method not implemented.');
  }
}

export default GetListingsForToken;
