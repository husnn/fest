import { WalletRepository } from '@fest/postgres';
import { EthereumService, RequestTestFundsResponse } from '@fest/shared';
import { NextFunction, Request, Response } from 'express';
import { HttpError, HttpResponse, ValidationError } from '../http';
import ConfigController from './ConfigController';

export class InternalController {
  private configController: ConfigController;
  private walletRepository: WalletRepository;
  private ethereumService: EthereumService;

  constructor(
    configController: ConfigController,
    walletRepository: WalletRepository,
    ethereumService: EthereumService
  ) {
    this.configController = configController;
    this.walletRepository = walletRepository;
    this.ethereumService = ethereumService;
  }
  async requestTestFunds(req: Request, res: Response, next: NextFunction) {
    try {
      const { protocol, currencyContract } = req.body;
      if (!protocol || !currencyContract) throw new ValidationError();

      const config = await this.configController.get();

      const currency = config.protocols['ETHEREUM'].currencies.find(
        (item) => item.contract == currencyContract
      );
      if (!currency) throw new HttpError('Currency not supported.');

      const wallet = await this.walletRepository.findByUser(protocol, req.user);

      const amountToSend = await this.ethereumService.toERC20Amount(
        currencyContract,
        10
      );

      const tx = await this.ethereumService.buildTransferERC20Tx(
        currencyContract,
        process.env.ETH_WALLET_ADDRESS,
        wallet.address,
        amountToSend
      );

      const result = await this.ethereumService.signAndSendTx(
        tx,
        process.env.ETH_WALLET_PK
      );
      if (!result.success) throw new HttpError('Could not send test funds.');

      return new HttpResponse<RequestTestFundsResponse>(res, {
        txHash: result.data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default InternalController;
