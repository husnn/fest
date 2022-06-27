import { OAuthProvider } from '@fest/shared';

import UseCase from '../../base/UseCase';
import OAuthRepository from '../../repositories/OAuthRepository';
import { Result } from '../../Result';

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

    await this.oAuthRepository.remove(auth);

    return Result.ok<UnlinkGoogleOutput>();
  }
}
