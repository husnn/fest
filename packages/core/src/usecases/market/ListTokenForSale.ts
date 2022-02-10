import { decryptText, EthereumService, WalletType } from '@fest/shared';
import UseCase from '../../base/UseCase';
import {
  TokenOwnershipRepository,
  TokenRepository,
  WalletRepository
} from '../../repositories';
import { Result } from '../../Result';
import { ApproveTokenSale } from '../token';

type ListTokenForSaleInput = {
  user: string;
  token: string;
  quantity: number;
  price: {
    currency: string;
    amount: string;
  };
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
    const { quantity, price } = data;

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
      const approvalTx = await this.ethereumService.buildApproveMarketTx(
        token.chain.contract,
        wallet.address
      );

      const approvalTxResult = await this.ethereumService.signAndSendTx(
        approvalTx,
        decryptText(wallet.privateKey)
      );

      if (!approvalTxResult.success) return Result.fail();
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
      price
    });

    if (!approval.success) return Result.fail();

    const { expiry, salt, signature } = approval.data;

    const tx = await this.ethereumService.buildListTokenForSaleTx(
      wallet.address,
      token.chain.contract,
      token.chain.id,
      quantity,
      price,
      expiry,
      salt,
      signature
    );

    const txResult = await this.ethereumService.signAndSendTx(
      tx,
      decryptText(wallet.privateKey)
    );

    return txResult.success
      ? Result.ok({ txHash: txResult.data })
      : Result.fail();
  }
}

export default ListTokenForSale;
