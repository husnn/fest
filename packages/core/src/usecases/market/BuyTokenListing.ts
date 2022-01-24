import Decimal from 'decimal.js';

import { decryptText, WalletType } from '@fest/shared';

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
    const subtotal = new Decimal(listing.price.amount).mul(data.quantity);

    const total = subtotal.mul(1.05); // Market buy fee pct

    const balance = await this.ethereumService.getERC20Balance(
      listing.price.currency.contract,
      wallet.address
    );

    if (new Decimal(balance).lessThan(total)) return Result.fail();

    // Check market is approved to use funds, approve if not
    const approvedAmount =
      await this.ethereumService.getApprovedSpenderERC20Amount(
        listing.price.currency.contract,
        wallet.address,
        listing.chain.contract
      );

    if (new Decimal(approvedAmount) < total) {
      const approveTx = await this.ethereumService.buildApproveERC20SpenderTx(
        listing.price.currency.contract,
        wallet.address,
        listing.chain.contract,
        total.toFixed()
      );

      const approveTxResult = await this.ethereumService.signAndSendTx(
        approveTx,
        decryptText(wallet.privateKey)
      );

      if (!approveTxResult.success) return Result.fail();
    }

    const buyTx = await this.ethereumService.buildBuyTokenListingTx(
      wallet.address,
      listing.chain.contract,
      listing.chain.id,
      data.quantity
    );

    const buyTxResult = await this.ethereumService.signAndSendTx(
      buyTx,
      decryptText(wallet.privateKey)
    );

    return buyTxResult.success
      ? Result.ok({ txHash: buyTxResult.data })
      : Result.fail();
  }
}
