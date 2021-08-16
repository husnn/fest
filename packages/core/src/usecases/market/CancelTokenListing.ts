import { WalletType } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { TokenListingRepository, WalletRepository } from '../../repositories';
import { Result } from '../../Result';
import { EthereumService } from '../../services';

type CancelTokenListingInput = {
  listing: string;
};

type CancelTokenListingOutput = {
  txHash: string;
};

export class CancelTokenListing extends UseCase<
  CancelTokenListingInput,
  CancelTokenListingOutput
> {
  private listingRepository: TokenListingRepository;
  private walletRepository: WalletRepository;
  private ethereumService: EthereumService;

  constructor(
    listingRepository: TokenListingRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService
  ) {
    super();

    this.listingRepository = listingRepository;
    this.walletRepository = walletRepository;
    this.ethereumService = ethereumService;
  }

  async exec(
    data: CancelTokenListingInput
  ): Promise<Result<CancelTokenListingOutput>> {
    const listing = await this.listingRepository.get(data.listing);
    if (!listing) return Result.fail();

    const wallet = await this.walletRepository.findByUser(
      listing.protocol,
      listing.sellerId,
      { select: ['privateKey'] }
    );

    if (!wallet) return Result.fail();
    if (wallet.type != WalletType.INTERNAL) return Result.fail();

    const txResult = await this.ethereumService.cancelTokenListing(
      wallet,
      listing
    );

    return txResult.success
      ? Result.ok({ txHash: txResult.data })
      : Result.fail();
  }
}
