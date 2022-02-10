import {
  AuthCheck,
  AuthError,
  AuthPrecheck,
  ChangeEmailAddress,
  EmailAddressChangeError,
  IdentifyWithEmail,
  IdentifyWithWallet,
  InviteRepository,
  LoginWithEmail,
  LoginWithWallet,
  MailService,
  RequestEmailAddressChange,
  RequestPasswordReset,
  ResetPassword,
  ResetPasswordError,
  UserRepository,
  WaitlistRepository,
  WalletRepository
} from '@fest/core';
import {
  AuthPrecheckResponse,
  ChangeEmailAddressResponse,
  EthereumService,
  IdentifyWithEmailResponse,
  IdentifyWithWalletResponse,
  isEmailAddress,
  LoginResponse,
  RequestEmailAddressChangeResponse,
  RequestPasswordResetResponse,
  ResetPasswordResponse
} from '@fest/shared';
import { NextFunction, Request, Response } from 'express';
import {
  HttpError,
  HttpResponse,
  NotFoundError,
  ValidationError
} from '../http';

class AuthController {
  private doAuthPrecheckUseCase: AuthPrecheck;

  private identifyWithEmailUseCase: IdentifyWithEmail;
  private identifyWithWalletUseCase: IdentifyWithWallet;

  private loginWithEmailUseCase: LoginWithEmail;
  private loginWithWalletUseCase: LoginWithWallet;

  private requestPasswordResetUseCase: RequestPasswordReset;
  private resetPasswordUseCase: ResetPassword;

  private requestEmailAddressChangeUseCase: RequestEmailAddressChange;
  private changeEmailAddressUseCase: ChangeEmailAddress;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    waitlistRepository: WaitlistRepository,
    inviteRepository: InviteRepository,
    ethereumService: EthereumService,
    mailService: MailService
  ) {
    this.doAuthPrecheckUseCase = new AuthPrecheck(
      userRepository,
      waitlistRepository
    );

    const authCheck = new AuthCheck(waitlistRepository, inviteRepository);

    this.identifyWithEmailUseCase = new IdentifyWithEmail(
      userRepository,
      walletRepository,
      ethereumService,
      mailService,
      authCheck,
      inviteRepository
    );

    this.identifyWithWalletUseCase = new IdentifyWithWallet(
      userRepository,
      walletRepository,
      authCheck,
      inviteRepository
    );

    this.loginWithEmailUseCase = new LoginWithEmail(userRepository);

    this.loginWithWalletUseCase = new LoginWithWallet(
      userRepository,
      walletRepository,
      ethereumService
    );

    this.requestPasswordResetUseCase = new RequestPasswordReset(
      userRepository,
      mailService
    );

    this.resetPasswordUseCase = new ResetPassword(userRepository);

    this.requestEmailAddressChangeUseCase = new RequestEmailAddressChange(
      userRepository,
      mailService
    );

    this.changeEmailAddressUseCase = new ChangeEmailAddress(
      userRepository,
      ethereumService,
      mailService
    );
  }

  async changeEmailAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password, signature } = req.body;
      if (!token) throw new ValidationError('Missing token.');
      if (!password && !signature)
        throw new ValidationError('Missing password or signature.');

      const result = await this.changeEmailAddressUseCase.exec({
        token,
        password,
        signature
      });
      if (!result.success) {
        switch (result.error) {
          case EmailAddressChangeError.INVALID_TOKEN:
            throw new ValidationError('Invalid or expired token.');
          case EmailAddressChangeError.INCORRECT_PASSWORD:
            throw new ValidationError('Incorrect password.');
          case EmailAddressChangeError.INVALID_SIGNATURE:
            throw new ValidationError('Invalid wallet signature.');
          default:
            throw new HttpError('Could not change email address.');
        }
      }

      return new HttpResponse<ChangeEmailAddressResponse>(res, {
        email: result.data.email
      });
    } catch (err) {
      next(err);
    }
  }

  async requestEmailChange(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!isEmailAddress(email))
        throw new HttpError('Invalid email address provided.');

      const result = await this.requestEmailAddressChangeUseCase.exec({
        userId: req.user,
        email
      });
      if (!result.success) {
        switch (result.error) {
          case EmailAddressChangeError.SAME_EMAIL:
            throw new ValidationError(
              'New email address cannot be the same as existing.'
            );
          case EmailAddressChangeError.EMAIL_ALREADY_IN_USE:
            throw new ValidationError(
              'The email address provided is already in use.'
            );
          default:
            throw new HttpError('Could not change email address.');
        }
      }

      return new HttpResponse<RequestEmailAddressChangeResponse>(res);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      if (!token || !password)
        throw new ValidationError('Missing token or password.');

      const result = await this.resetPasswordUseCase.exec({
        token,
        password,
        ip: req.ip
      });
      if (!result.success) {
        switch (result.error) {
          case ResetPasswordError.INVALID_TOKEN:
            throw new ValidationError('Invalid or expired token.');
          default:
            throw new HttpError('Could not reset password.');
        }
      }

      return new HttpResponse<ResetPasswordResponse>(res, result.data);
    } catch (err) {
      next(err);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await this.requestPasswordResetUseCase.exec({
        email
      });
      if (!result.success)
        throw new HttpError('Could not request password reset.');

      return new HttpResponse<RequestPasswordResetResponse>(res);
    } catch (err) {
      next(err);
    }
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
        code,
        ip: req.ip
      });

      if (!result.success) {
        switch (result.error) {
          case AuthError.PASSWORD_INCORRECT:
            throw new ValidationError('Incorrect email or password.');
          case AuthError.CODE_EXPIRED:
          case AuthError.CODE_INCORRECT:
            throw new ValidationError('Incorrect or expired code.');
          default:
            throw new HttpError('Could not login.');
        }
      }

      const { token, expiry, user } = result.data;

      return new HttpResponse<LoginResponse>(res, {
        token,
        expiry,
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
        signature,
        ip: req.ip
      });

      const { token, expiry, user } = result.data;

      return new HttpResponse<LoginResponse>(res, {
        token,
        expiry,
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
