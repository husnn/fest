import { WalletRepository } from '@fest/core';
import { decryptText, EthereumService, Protocol } from '@fest/shared';
import UseCase from '../../base/UseCase';
import Result from '../../Result';

type WithdrawMarketEarningsInput = {
  user: string;
  protocol: Protocol;
  currency: string;
  amount: string;
};
type WithdrawMarketEarningsOutput = {
  txHash: string;
};

export class WithdrawMarketEarnings extends UseCase<
  WithdrawMarketEarningsInput,
  WithdrawMarketEarningsOutput
> {
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

  async exec(
    data: WithdrawMarketEarningsInput
  ): Promise<Result<WithdrawMarketEarningsOutput>> {
    const wallet = await this.walletRepository.findByUser(
      data.protocol,
      data.user,
      { select: ['privateKey'] }
    );

    const tx = await this.ethereumService.buildWithdrawMarketEarningsTx(
      wallet.address,
      data.currency,
      data.amount
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

export default WithdrawMarketEarnings;
