import { WalletRepository } from '@fest/postgres';
import {
  EthereumService,
  EthereumTx,
  RequestTestFundsResponse
} from '@fest/shared';
import { NextFunction, Request, Response } from 'express';
import { isProduction } from '../config';
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
      if (isProduction)
        throw new HttpError('Operation not allowed in production.');

      const { protocol, currencyContract } = req.body;
      if (!protocol) throw new ValidationError();

      let tx: EthereumTx;
      const wallet = await this.walletRepository.findByUser(protocol, req.user);

      if (currencyContract && currencyContract !== '0x0') {
        const config = await this.configController.get();

        const currency = config.protocols['ETHEREUM'].currencies.find(
          (item) => item.contract == currencyContract
        );
        if (!currency) throw new HttpError('Currency not supported.');

        const amountToSend = await this.ethereumService.toERC20Amount(
          currencyContract,
          10
        );

        tx = await this.ethereumService.buildTransferERC20Tx(
          currencyContract,
          process.env.ETH_WALLET_ADDRESS,
          wallet.address,
          amountToSend
        );
      } else {
        let amountToSend: string;

        switch (this.ethereumService.chainId) {
          case 80001:
            amountToSend = '0.1';
            break;
          case 1337:
            amountToSend = '1';
            break;
          case 3:
            amountToSend = '0.05';
            break;
          default:
            amountToSend = '0.01';
        }

        tx = await this.ethereumService.buildSendEtherTx(
          process.env.ETH_WALLET_ADDRESS,
          wallet.address,
          amountToSend
        );
      }

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
