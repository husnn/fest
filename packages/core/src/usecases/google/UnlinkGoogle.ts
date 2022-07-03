import { OAuthProvider, Result } from '@fest/shared';

import OAuthRepository from '../../repositories/OAuthRepository';
import UseCase from '../../base/UseCase';

export interface UnlinkGoogleInput {
  user: string;
}
export type UnlinkGoogleOutput = any;

export class UnlinkGoogle extends UseCase<
  UnlinkGoogleInput,
  UnlinkGoogleOutput
> {
  private oAuthRepository: OAuthRepository;

  constructor(oAuthRepository: OAuthRepository) {
    super();

    this.oAuthRepository = oAuthRepository;
  }

  async exec(data: UnlinkGoogleInput): Promise<Result<UnlinkGoogleOutput>> {
    const auth = await this.oAuthRepository.findByUser(
      OAuthProvider.GOOGLE,
      data.user
    );

    auth.accessToken = null;
    auth.refreshToken = null;
    auth.expiry = null;

    await this.oAuthRepository.update(auth);

    return Result.ok<UnlinkGoogleOutput>();
  }
}
