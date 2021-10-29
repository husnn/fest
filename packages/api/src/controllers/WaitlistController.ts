import { HttpError, HttpResponse, ValidationError } from '../http';
import { JoinWaitlist, WaitlistRepository } from '@fanbase/core';
import {
  JoinWaitlistResponse,
  isEmailAddress,
  isEthereumAddress
} from '@fanbase/shared';
import { NextFunction, Request, Response } from 'express';

export class WaitlistController {
  private joinWaitlistUseCase: JoinWaitlist;

  constructor(waitlistRepository: WaitlistRepository) {
    this.joinWaitlistUseCase = new JoinWaitlist(waitlistRepository);
  }

  async joinWaitlist(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, emailAddress, useWallet, socialMedia } = req.body;

      let walletAddress = req.body.walletAddress;

      if (!emailAddress || !isEmailAddress(emailAddress))
        throw new ValidationError('Invalid email address.');

      if (!isEthereumAddress(walletAddress)) {
        if (useWallet)
          throw new ValidationError('Missing or invalid wallet address.');
        walletAddress = null;
      }

      const result = await this.joinWaitlistUseCase.exec({
        type,
        email: emailAddress,
        wallet: walletAddress,
        social: socialMedia
      });

      if (!result.success) throw new HttpError('Could not join waitlist.');

      return new HttpResponse<JoinWaitlistResponse>(res);
    } catch (err) {
      next(err);
    }
  }
}

export default WaitlistController;
