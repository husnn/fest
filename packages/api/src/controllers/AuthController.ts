import {
  AuthCheck,
  AuthError,
  AuthPrecheck,
  EthereumService,
  IdentifyWithEmail,
  IdentifyWithWallet,
  InviteRepository,
  LoginWithEmail,
  LoginWithWallet,
  MailService,
  UserRepository,
  WaitlistRepository,
  WalletRepository
} from '@fanbase/core';
import {
  AuthPrecheckResponse,
  IdentifyWithEmailResponse,
  IdentifyWithWalletResponse,
  LoginResponse,
  isEmailAddress
} from '@fanbase/shared';
import {
  HttpError,
  HttpResponse,
  NotFoundError,
  ValidationError
} from '../http';
import { NextFunction, Request, Response } from 'express';

class AuthController {
  private doAuthPrecheckUseCase: AuthPrecheck;

  private identifyWithEmailUseCase: IdentifyWithEmail;
  private identifyWithWalletUseCase: IdentifyWithWallet;

  private loginWithEmailUseCase: LoginWithEmail;
  private loginWithWalletUseCase: LoginWithWallet;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    waitlistRepository: WaitlistRepository,
    inviteRepository: InviteRepository,
    ethereumService: EthereumService,
    mailService: MailService
  ) {
    this.doAuthPrecheckUseCase = new AuthPrecheck(userRepository);

    const authCheck = new AuthCheck(waitlistRepository, inviteRepository);

    this.identifyWithEmailUseCase = new IdentifyWithEmail(
      userRepository,
      walletRepository,
      ethereumService,
      mailService,
      authCheck
    );

    this.identifyWithWalletUseCase = new IdentifyWithWallet(
      userRepository,
      walletRepository,
      authCheck
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
      const { identifier } = req.body;

      if (!identifier)
        throw new ValidationError('Please provide an email or wallet address.');

      const precheck = await this.doAuthPrecheckUseCase.exec({ identifier });

      if (!precheck.success)
        throw new HttpError('Could not perform auth precheck.');

      return new HttpResponse<AuthPrecheckResponse>(res, {
        exists: precheck.data.exists,
        needsInvite: precheck.data.needsInvite
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
          case AuthError.CODE_EXPIRED:
          case AuthError.CODE_INCORRECT:
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

  getIdentificationError(error): HttpError {
    switch (error) {
      case AuthError.INVITE_CODE_MISSING:
        return new ValidationError('Sorry, we are currently invite-only.');
      case AuthError.INVITE_NOT_FOUND:
        return new NotFoundError('Could not find invite.');
      case AuthError.INVITE_INVALID:
        return new ValidationError('Expired or inactive invite.');
      default:
        return new HttpError();
    }
  }

  async identifyWithEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, invite } = req.body;

      if (!email) throw new ValidationError('Missing email address.');

      const result = await this.identifyWithEmailUseCase.exec({
        email,
        password,
        invite
      });

      if (!result.success) throw this.getIdentificationError(result.error);

      return new HttpResponse<IdentifyWithEmailResponse>(res);
    } catch (err) {
      next(err);
    }
  }

  async identifyWithWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const { protocol, address, invite } = req.body;

      if (!protocol || !address) {
        throw new ValidationError('Missing wallet protocol or address.');
      }

      const result = await this.identifyWithWalletUseCase.exec({
        protocol,
        address,
        invite
      });

      if (!result.success) throw this.getIdentificationError(result.error);

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
