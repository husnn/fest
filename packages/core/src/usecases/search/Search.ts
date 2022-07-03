import { Result, UserDTO } from '@fest/shared';

import UseCase from '../../base/UseCase';
import UserRepository from '../../repositories/UserRepository';

type SearchInput = {
  keyword: string;
  count: number;
  page: number;
};
type SearchOutput = {
  users: UserDTO[];
  total: number;
};

export class Search extends UseCase<SearchInput, SearchOutput> {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
  }

  async exec(data: SearchInput): Promise<Result<SearchOutput>> {
    if (data.keyword.length < 3) return Result.fail();

    const queryResult = await this.userRepository.findSimilar(
      data.keyword,
      data.count,
      data.page
    );

    return Result.ok({
      users: queryResult.users.map((u) => new UserDTO(u)),
      total: queryResult.total
    });
  }
}

export default Search;
