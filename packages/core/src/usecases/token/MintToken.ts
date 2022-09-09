import { EthereumService, Protocol, Result } from '@fest/shared';
import { TokenRepository, WalletRepository } from '../../repositories';

import { ApproveMint } from '.';
import UseCase from '../../base/UseCase';

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

  private approveMintUseCase: ApproveMint;

  constructor(
    walletRepository: WalletRepository,
    tokenRepository: TokenRepository,
    ethereumService: EthereumService,
    approveMintUseCase: ApproveMint
  ) {
    super();

    this.walletRepository = walletRepository;
    this.tokenRepository = tokenRepository;
    this.ethereumService = ethereumService;

    this.approveMintUseCase = approveMintUseCase;
  }

  async exec(data: MintTokenInput): Promise<Result<MintTokenOutput>> {
    const wallet = await this.walletRepository.findByUser(
      data.protocol,
      data.user
    );

    const approvalResult = await this.approveMintUseCase.exec(data);
    if (!approvalResult.success) return Result.fail(approvalResult.error);

    const {
      data: approvalData,
      ipfsUri,
      signature,
      expiry,
      nonce
    } = approvalResult.data;

    const token = await this.tokenRepository.get(data.token);
    if (!token) return Result.fail();
    if (token.creatorId !== data.user) return Result.fail();

    const tx = await this.ethereumService.buildMintTokenProxyTx(
      wallet.address,
      token.supply,
      ipfsUri,
      token.royaltyPct,
      approvalData,
      nonce,
      expiry,
      signature
    );

    const txResult = await this.ethereumService.signAndSendTx(
      tx,
      process.env.ETH_WALLET_PK
    );

    return txResult.success
      ? Result.ok({ txHash: txResult.data })
      : Result.fail();
  }
}
