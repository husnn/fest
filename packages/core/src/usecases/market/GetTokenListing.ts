import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';

type GetTokenListingInput = {
  token: string;
};

type GetTokenListingOutput = {
  trade: string;
};

export class GetTokenListing extends UseCase<
  GetTokenListingInput,
  GetTokenListingOutput
> {
  exec(data: GetTokenListingInput): Promise<Result<GetTokenListingOutput>> {
    throw new Error('Method not implemented.');
  }
}
