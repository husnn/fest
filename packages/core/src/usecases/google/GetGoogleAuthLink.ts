import { GoogleService } from '../../services';
import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';

export interface GetGoogleAuthLinkInput {
  state?: string;
}
export type GetGoogleAuthLinkOutput = string;

export class GetGoogleAuthLink extends UseCase<
  GetGoogleAuthLinkInput,
  GetGoogleAuthLinkOutput
> {
  private googleService: GoogleService;

  constructor(googleService: GoogleService) {
    super();

    this.googleService = googleService;
  }

  async exec(
    data?: GetGoogleAuthLinkInput
  ): Promise<Result<GetGoogleAuthLinkOutput>> {
    const result = this.googleService.getOAuthLink(data?.state);
    return result.success ? Result.ok(result.data) : Result.fail();
  }
}
