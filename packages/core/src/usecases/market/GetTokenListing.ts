import UseCase from '../../base/UseCase';
import { Result } from '../../Result';

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
