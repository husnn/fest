import UseCase from '../../base/UseCase';
import { Result } from '../../Result';
import { GoogleService } from '../../services';

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
