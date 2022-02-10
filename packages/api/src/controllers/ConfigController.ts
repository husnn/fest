import { Config } from '@fest/ethereum';
import { EthereumService, InitConfig, InitResponse } from '@fest/shared';
import { Request, Response } from 'express';
import { HttpResponse } from '../http';

const EXPIRATION_SECS = 300; // 5 mins

export default class ConfigController {
  private ethereumService: EthereumService;

  constructor(ethereumService: EthereumService) {
    this.ethereumService = ethereumService;
  }

  private config: InitConfig;

  async init(req: Request, res: Response) {
    const config = await this.get();
    new HttpResponse<InitResponse>(res, { body: config });
  }

  async get(): Promise<InitConfig> {
    const t = new Date();

    if (!this.config || new Date(this.config.expires) <= t) {
      t.setSeconds(t.getSeconds() + EXPIRATION_SECS);

      this.config = {
        expires: t,
        protocols: {
          ETHEREUM: await Config.generate(this.ethereumService)
        }
      };
    }

    return this.config;
  }
}
