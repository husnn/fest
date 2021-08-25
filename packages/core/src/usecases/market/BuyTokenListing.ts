import { WalletType } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { TokenListingRepository, WalletRepository } from '../../repositories';
import { Result } from '../../Result';
import { EthereumService } from '../../services';

type BuyTokenListingInput = {
  buyer: string;
  listing: string;
  quantity: number;
};

type BuyTokenListingOutput = {
  txHash: string;
};

export class BuyTokenListing extends UseCase<
  BuyTokenListingInput,
  BuyTokenListingOutput
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
    data: BuyTokenListingInput
  ): Promise<Result<BuyTokenListingOutput>> {
    const listing = await this.listingRepository.get(data.listing);
    if (!listing) return Result.fail();

    const wallet = await this.walletRepository.findByUser(
      listing.protocol,
      data.buyer,
      { select: ['privateKey'] }
    );

    if (!wallet) return Result.fail();
    if (wallet.type != WalletType.INTERNAL) return Result.fail();

    // Check balance
    const subtotal =
      this.ethereumService.fromWei(listing.price) * data.quantity;
    const total = subtotal * 1.05; // Market buy fee pct

    const balance = await this.ethereumService.getERC20Balance(
      listing.currency,
      wallet.address
    );

    if (balance < total) return Result.fail();

    // Check market is approved to use funds, approve if not
    const approvedAmount =
      await this.ethereumService.getMarketApprovedERC20Amount(
        listing.currency,
        wallet.address,
        listing.chain.contract
      );

    if (this.ethereumService.fromWei(approvedAmount) < total) {
      const result = await this.ethereumService.approveMarketToSpendERC20(
        listing.currency,
        wallet,
        listing.chain.contract,
        this.ethereumService.toWei(total)
      );

      if (!result.success) return Result.fail();
    }

    const txResult = await this.ethereumService.buyTokenListing(
      wallet,
      listing.chain.contract,
      listing.chain.id,
      data.quantity
    );

    return txResult.success
      ? Result.ok({ txHash: txResult.data })
      : Result.fail();
  }
}
