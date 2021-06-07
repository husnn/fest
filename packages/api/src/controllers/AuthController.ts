import { NextFunction, Request, Response } from 'express';

import {
  EthereumService, IdentifyWithEmail, IdentifyWithWallet, LoginError, LoginWithEmail,
  LoginWithWallet, MailService, TokenRepository, UserRepository, WalletRepository
} from '@fanbase/core';
import {
  IdentifyWithEmailResponse, IdentifyWithWalletResponse, LoginWithEmailRequest,
  LoginWithEmailResponse
} from '@fanbase/shared';

import { HttpError, HttpResponse } from '../http';
import ValidationError from '../http/errors/ValidationError';

class AuthController {
  private identifyWithEmailUseCase: IdentifyWithEmail;
  private identifyWithWalletUseCase: IdentifyWithWallet;

  private loginWithEmailUseCase: LoginWithEmail;
  private loginWithWalletUseCase: LoginWithWallet;

  constructor (
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    tokenRepository: TokenRepository,
    ethereumService: EthereumService,
    mailService: MailService
  ) {
    this.identifyWithEmailUseCase = new IdentifyWithEmail(
      userRepository,
      walletRepository,
      ethereumService,
      mailService
    );

    this.identifyWithWalletUseCase = new IdentifyWithWallet(
      userRepository,
      walletRepository
    );

    this.loginWithEmailUseCase = new LoginWithEmail(userRepository);

    this.loginWithWalletUseCase = new LoginWithWallet(
      userRepository,
      walletRepository,
      ethereumService
    );
  }

  async loginWithEmail (req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code } = req.body;

      const result = await this.loginWithEmailUseCase.exec({ email, code });

      if (!result.success) {
        switch (result.error) {
          case LoginError.CODE_EXPIRED:
          case LoginError.CODE_INCORRECT:
            throw new ValidationError('Incorrect or expired code.');
          case LoginError.USER_NOT_FOUND:
            throw new ValidationError('Could not find user.');
          default:
            throw new HttpError('Could not login.');
        }
      }

      const { token, user } = result.data;

      return new HttpResponse<LoginWithEmailResponse>(res, {
        token,
        user: {
          id: user.id,
          address: user.wallet?.address,
          email: user.email
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async loginWithWallet (req: Request, res: Response, next: NextFunction) {
    try {
      const { protocol, code, signature } = req.body;

      const result = await this.loginWithWalletUseCase.exec({
        protocol,
        code,
        signature
      });

      const { token, user } = result.data;

      return new HttpResponse<LoginWithEmailResponse>(res, {
        token,
        user: {
          id: user.id,
          address: user.wallet?.address,
          email: user.email
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async identifyWithEmail (req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) throw new ValidationError('Missing email address.');

      await this.identifyWithEmailUseCase.exec({ email });

      return new HttpResponse<IdentifyWithEmailResponse>(res);
    } catch (err) {
      next(err);
    }
  }

  async identifyWithWallet (req: Request, res: Response, next: NextFunction) {
    try {
      const { protocol, address } = req.body;

      if (!protocol || !address) { throw new ValidationError('Missing wallet protocol or address.'); }

      const result = await this.identifyWithWalletUseCase.exec({
        protocol,
        address
      });

      if (!result.success) throw new HttpError();

      return new HttpResponse<IdentifyWithWalletResponse>(res, {
        body: {
          code: result.data.code,
          message: result.data.message
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
