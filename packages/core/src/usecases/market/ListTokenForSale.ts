import { WalletType } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { TokenOwnershipRepository, TokenRepository, WalletRepository } from '../../repositories';
import { Result } from '../../Result';
import { EthereumService } from '../../services';
import { ApproveTokenSale } from '../token';

type ListTokenForSaleInput = {
  user: string;
  token: string;
  quantity: number;
  currency: string;
  price: number;
};

type ListTokenForSaleOutput = {
  txHash: string;
};

export class ListTokenForSale extends UseCase<
  ListTokenForSaleInput,
  ListTokenForSaleOutput
> {
  private walletRepository: WalletRepository;
  private tokenRepository: TokenRepository;
  private ownershipRepository: TokenOwnershipRepository;
  private ethereumService: EthereumService;

  constructor(
    walletRepository: WalletRepository,
    tokenRepository: TokenRepository,
    ownershipRepository: TokenOwnershipRepository,
    ethereumService: EthereumService
  ) {
    super();

    this.walletRepository = walletRepository;
    this.tokenRepository = tokenRepository;
    this.ownershipRepository = ownershipRepository;
    this.ethereumService = ethereumService;
  }

  async exec(
    data: ListTokenForSaleInput
  ): Promise<Result<ListTokenForSaleOutput>> {
    const { quantity, currency, price } = data;

    const token = await this.tokenRepository.get(data.token);
    if (!token) return Result.fail();

    const wallet = await this.walletRepository.findByUser(
      token.chain.protocol,
      data.user,
      {
        select: ['privateKey']
      }
    );

    if (!wallet) return Result.fail();
    if (wallet.type != WalletType.INTERNAL) return Result.fail();

    const ownership = await this.ownershipRepository.findByWalletAndToken(
      wallet.id,
      token.id
    );

    if (data.quantity > ownership.quantity) return Result.fail();

    const isMarketApproved = await this.ethereumService.checkMarketApproved(
      token.chain.contract,
      wallet.address
    );

    if (!isMarketApproved) {
      const marketApproval = await this.ethereumService.approveMarket(
        token.chain.contract,
        wallet
      );

      if (!marketApproval.success) return Result.fail();
    }

    const approveTokenSaleUseCase = new ApproveTokenSale(
      this.walletRepository,
      this.tokenRepository,
      this.ownershipRepository,
      this.ethereumService
    );

    const approval = await approveTokenSaleUseCase.exec({
      user: data.user,
      token: token.id,
      quantity,
      currency,
      price
    });

    if (!approval.success) return Result.fail();

    const { expiry, salt, signature } = approval.data;

    const txResult = await this.ethereumService.listTokenForSale(
      wallet,
      token.chain.contract,
      token.chain.id,
      quantity,
      currency,
      price,
      expiry,
      salt,
      signature
    );

    return txResult.success
      ? Result.ok({ txHash: txResult.data })
      : Result.fail();
  }
}

export default ListTokenForSale;
