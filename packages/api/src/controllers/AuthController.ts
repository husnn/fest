import {
  DoAuthPrecheck,
  EthereumService,
  IdentifyWithEmail,
  IdentifyWithWallet,
  LoginError,
  LoginWithEmail,
  LoginWithWallet,
  MailService,
  UserRepository,
  WalletRepository
} from '@fanbase/core';
import {
  DoAuthPrecheckResponse,
  IdentifyWithEmailResponse,
  IdentifyWithWalletResponse,
  LoginResponse,
  isEmailAddress
} from '@fanbase/shared';
import { HttpError, HttpResponse, ValidationError } from '../http';
import { NextFunction, Request, Response } from 'express';

class AuthController {
  private userRepository: UserRepository;

  private doAuthPrecheckUseCase: DoAuthPrecheck;

  private identifyWithEmailUseCase: IdentifyWithEmail;
  private identifyWithWalletUseCase: IdentifyWithWallet;

  private loginWithEmailUseCase: LoginWithEmail;
  private loginWithWalletUseCase: LoginWithWallet;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService,
    mailService: MailService
  ) {
    this.userRepository = userRepository;

    this.doAuthPrecheckUseCase = new DoAuthPrecheck(userRepository);

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

  async doPrecheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!isEmailAddress(email))
        throw new ValidationError('Please provide a valid email address.');

      const precheck = await this.doAuthPrecheckUseCase.exec({ email });

      if (!precheck.success)
        throw new HttpError('Could not perform auth precheck.');

      return new HttpResponse<DoAuthPrecheckResponse>(res, {
        exists: precheck.data.exists
      });
    } catch (err) {
      next(err);
    }
  }

  async loginWithEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, code } = req.body;

      const result = await this.loginWithEmailUseCase.exec({
        email,
        password,
        code
      });

      if (!result.success) {
        switch (result.error) {
          case LoginError.CODE_EXPIRED:
          case LoginError.CODE_INCORRECT:
            throw new ValidationError('Incorrect or expired code.');
          default:
            throw new HttpError('Could not login.');
        }
      }

      const { token, user } = result.data;

      return new HttpResponse<LoginResponse>(res, {
        token,
        user
      });
    } catch (err) {
      next(err);
    }
  }

  async loginWithWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const { protocol, code, signature } = req.body;

      const result = await this.loginWithWalletUseCase.exec({
        protocol,
        code,
        signature
      });

      const { token, user } = result.data;

      return new HttpResponse<LoginResponse>(res, {
        token,
        user
      });
    } catch (err) {
      next(err);
    }
  }

  async identifyWithEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email) throw new ValidationError('Missing email address.');

      await this.identifyWithEmailUseCase.exec({ email, password });

      return new HttpResponse<IdentifyWithEmailResponse>(res);
    } catch (err) {
      next(err);
    }
  }

  async identifyWithWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const { protocol, address } = req.body;

      if (!protocol || !address) {
        throw new ValidationError('Missing wallet protocol or address.');
      }

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
