import { Protocol, randomNumericString } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { WalletRepository } from '../../repositories';
import { Result } from '../../Result';
import { EthereumService } from '../../services';

export interface ApproveMintInput {
  protocol: Protocol;
  user: string;
  supply: string;
}

export interface ApproveMintOutput {
  data: string;
  signature: string;
  salt: string;
}

export class ApproveMint extends UseCase<ApproveMintInput, ApproveMintOutput> {
  private walletRepository: WalletRepository;
  private ethereumService: EthereumService;

  constructor(
    walletRepository: WalletRepository,
    ethereumService: EthereumService
  ) {
    super();

    this.walletRepository = walletRepository;
    this.ethereumService = ethereumService;
  }

  async exec(data: ApproveMintInput): Promise<Result<ApproveMintOutput>> {
    const wallet = await this.walletRepository.findByUser(
      data.protocol,
      data.user
    );

    const salt = randomNumericString(32);

    const result = await this.ethereumService.signMint(
      wallet.address,
      data.supply,
      salt
    );

    const { signature } = result.data;

    return Result.ok({ data: '', signature, salt });
  }
}
