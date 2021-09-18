import {
    decryptText, encryptText, Protocol, randomNumericString, WalletType
} from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { TokenRepository, WalletRepository } from '../../repositories';
import { Result } from '../../Result';
import { EthereumService } from '../../services';

export interface MintTokenInput {
  protocol: Protocol;
  user: string;
  token: string;
}

export interface MintTokenOutput {
  txHash: string;
}

export class MintToken extends UseCase<MintTokenInput, MintTokenOutput> {
  private walletRepository: WalletRepository;
  private tokenRepository: TokenRepository;
  private ethereumService: EthereumService;

  constructor(
    walletRepository: WalletRepository,
    tokenRepository: TokenRepository,
    ethereumService: EthereumService
  ) {
    super();

    this.walletRepository = walletRepository;
    this.tokenRepository = tokenRepository;
    this.ethereumService = ethereumService;
  }

  async exec(data: MintTokenInput): Promise<Result<MintTokenOutput>> {
    const wallet = await this.walletRepository.findByUser(
      data.protocol,
      data.user,
      {
        select: ['privateKey']
      }
    );

    if (wallet.type != WalletType.INTERNAL) return Result.fail();

    const token = await this.tokenRepository.get(data.token);

    if (!token) return Result.fail();
    if (token.creatorId !== data.user) return Result.fail();

    const expiry = Math.floor(Date.now() / 1000) + 600; // Expires in 10 minutes
    const salt = randomNumericString(32);

    const result = await this.ethereumService.signMint(
      wallet.address,
      token.supply,
      expiry,
      salt
    );

    const { signature } = result.data;

    const tx = await this.ethereumService.buildMintTokenTx(
      wallet.address,
      token.supply,
      token.fees,
      encryptText(token.id),
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
