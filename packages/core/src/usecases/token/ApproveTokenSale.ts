import { EthereumService, MarketFees, randomNumericString } from '@fest/shared';
import UseCase from '../../base/UseCase';
import {
  TokenOwnershipRepository,
  TokenRepository,
  WalletRepository
} from '../../repositories';
import { Result } from '../../Result';

export interface ApproveTokenSaleInput {
  user: string;
  token: string;
  quantity: number;
  price: {
    currency: string;
    amount: string;
  };
}

export interface ApproveTokenSaleOutput {
  fees: MarketFees;
  nonce: string;
  expiry: number;
  signature: string;
}

export class ApproveTokenSale extends UseCase<
  ApproveTokenSaleInput,
  ApproveTokenSaleOutput
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
    data: ApproveTokenSaleInput
  ): Promise<Result<ApproveTokenSaleOutput>> {
    const token = await this.tokenRepository.get(data.token);

    if (!token) return Result.fail();

    const wallet = await this.walletRepository.findByUser(
      token.chain.protocol,
      data.user
    );

    const ownership = await this.ownershipRepository.findByWalletAndToken(
      wallet.id,
      token.id
    );

    if (ownership.walletId !== wallet.id) return Result.fail();

    const expiry = Math.floor(Date.now() / 1000) + 600; // Expires in 10 minutes
    const nonce = randomNumericString(32);

    const fees: MarketFees = {
      buyerPct: 500,
      sellerPct: 500
    };

    const result = await this.ethereumService.signTokenSale(
      wallet.address,
      token.chain.contract,
      token.chain.id,
      data.quantity,
      data.price,
      fees,
      nonce,
      expiry
    );

    const { signature } = result.data;

    return Result.ok({ fees, nonce, expiry, signature });
  }
}
