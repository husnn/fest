import {
  TokenOwnershipRepository,
  TokenRepository,
  WalletRepository
} from '../../repositories';

import { EthereumService } from '../../services';
import { Result } from '../../Result';
import UseCase from '../../base/UseCase';
import { randomNumericString } from '@fanbase/shared';

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
  expiry: number;
  salt: string;
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

    // TODO: Verify token and currency contracts are approved.

    const expiry = Math.floor(Date.now() / 1000) + 600; // Expires in 10 minutes
    const salt = randomNumericString(32);

    const result = await this.ethereumService.signTokenSale(
      wallet.address,
      token.chain.contract,
      token.chain.id,
      data.quantity,
      data.price,
      expiry,
      salt
    );

    const { signature } = result.data;

    return Result.ok({ expiry, salt, signature });
  }
}
