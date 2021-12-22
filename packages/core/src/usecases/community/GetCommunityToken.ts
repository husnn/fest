import { GetCommunity } from '@fanbase/core';
import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { generateCommunityToken } from './generate';

type GetCommunityTokenInput = {
  user: string;
  community: string;
};

type GetCommunityTokenOutput = {
  token: string;
};

export class GetCommunityToken extends UseCase<
  GetCommunityTokenInput,
  GetCommunityTokenOutput
> {
  private getCommunityUseCase: GetCommunity;

  constructor(getCommunityUseCase: GetCommunity) {
    super();

    this.getCommunityUseCase = getCommunityUseCase;
  }

  async exec(
    data: GetCommunityTokenInput
  ): Promise<Result<GetCommunityTokenOutput>> {
    const result = await this.getCommunityUseCase.exec({
      id: data.community,
      user: data.user
    });
    if (!result.success) return Result.fail();

    return result.success
      ? Result.ok<GetCommunityTokenOutput>({
          token: generateCommunityToken(data.community)
        })
      : Result.fail();
  }
}
