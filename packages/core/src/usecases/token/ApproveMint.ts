import {
  EthereumService,
  Protocol,
  Result,
  randomNumericString
} from '@fest/shared';
import { TokenRepository, WalletRepository } from '../../repositories';

import { IPFSService } from '../../services';
import UseCase from '../../base/UseCase';
import { pinToIPFS } from './pinToIPFS';

export interface ApproveMintInput {
  protocol: Protocol;
  user: string;
  token: string;
}

export interface ApproveMintOutput {
  data: string;
  nonce: string;
  expiry: number;
  signature: string;
  ipfsUri: string;
}

export class ApproveMint extends UseCase<ApproveMintInput, ApproveMintOutput> {
  private walletRepository: WalletRepository;
  private tokenRepository: TokenRepository;
  private ethereumService: EthereumService;
  private ipfsService: IPFSService;

  constructor(
    walletRepository: WalletRepository,
    tokenRepository: TokenRepository,
    ethereumService: EthereumService,
    ipfsService: IPFSService
  ) {
    super();

    this.walletRepository = walletRepository;
    this.tokenRepository = tokenRepository;
    this.ethereumService = ethereumService;
    this.ipfsService = ipfsService;
  }

  async exec(data: ApproveMintInput): Promise<Result<ApproveMintOutput>> {
    const wallet = await this.walletRepository.findByUser(
      data.protocol,
      data.user
    );

    const token = await this.tokenRepository.get(data.token);
    if (!token || token.minted) return Result.fail();
    if (token.creatorId !== data.user) return Result.fail();

    const pinResult = await pinToIPFS(
      this.tokenRepository,
      this.ipfsService,
      token
    );
    if (!pinResult.success) return Result.fail(pinResult.error);

    const expiry = Math.floor(Date.now() / 1000) + 600; // Expires in 10 minutes
    const nonce = randomNumericString(32);

    const result = await this.ethereumService.signMint(
      wallet.address,
      token.supply,
      pinResult.data.uri,
      token.royaltyPct,
      token.id,
      nonce,
      expiry
    );

    const { signature } = result.data;

    return Result.ok({
      data: token.id,
      nonce,
      expiry,
      signature,
      ipfsUri: pinResult.data.uri
    });
  }
}
