import { TokenListingDTO } from '@fest/shared';

import UseCase from '../../base/UseCase';
import { TokenListingRepository } from '../../repositories';
import Result from '../../Result';

type GetListingsForTokenInput = {
  token: string;
  count: number;
  page: number;
};

type GetListingsForTokenOutput = {
  listings: TokenListingDTO[];
  total: number;
};

export class GetListingsForToken extends UseCase<
  GetListingsForTokenInput,
  GetListingsForTokenOutput
> {
  private listingRepository: TokenListingRepository;

  constructor(listingRepository: TokenListingRepository) {
    super();

    this.listingRepository = listingRepository;
  }

  async exec(
    data: GetListingsForTokenInput
  ): Promise<Result<GetListingsForTokenOutput>> {
    const result = await this.listingRepository.findByToken(
      data.token,
      {
        onlyActive: true
      },
      data.count,
      data.page
    );
    const listings = result.listings.map(
      (listing) => new TokenListingDTO(listing)
    );

    return Result.ok({ listings, total: result.total });
  }
}

export default GetListingsForToken;
