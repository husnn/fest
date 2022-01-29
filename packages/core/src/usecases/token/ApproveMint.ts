import { EthereumService, IPFSService } from '../../services';
import { Protocol, encryptText, randomNumericString } from '@fest/shared';
import { TokenRepository, WalletRepository } from '../../repositories';

import { Result } from '../../Result';
import UseCase from '../../base/UseCase';
import { pinToIPFS } from './pinToIPFS';

export interface ApproveMintInput {
  protocol: Protocol;
  user: string;
  token: string;
}

export interface ApproveMintOutput {
  data: string;
  expiry: number;
  salt: string;
  signature: string;
  ipfsHash: string;
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
    if (!pinResult.success) return Result.fail();

    const expiry = Math.floor(Date.now() / 1000) + 600; // Expires in 10 minutes
    const salt = randomNumericString(32);

    const result = await this.ethereumService.signMint(
      wallet.address,
      token.supply,
      pinResult.data.hash,
      expiry,
      salt
    );

    const { signature } = result.data;

    return Result.ok({
      data: encryptText(token.id),
      expiry,
      salt,
      signature,
      ipfsHash: pinResult.data.hash
    });
  }
}
