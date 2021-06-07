import { User } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { UserRepository } from '../../repositories';
import { Result } from '../../Result';

export interface GetUserInput {
  id?: string;
  username?: string;
}

export type GetUserOutput = User;

export class GetUser extends UseCase<GetUserInput, GetUserOutput> {
  private userRepository: UserRepository;

  constructor (userRepository: UserRepository) {
    super();

    this.userRepository = userRepository;
  }

  async exec (data: GetUserInput): Promise<Result<GetUserOutput>> {
    let user: User;

    if (data.id) {
      user = await this.userRepository.get(data.id);
    } else if (data.username) {
      user = await this.userRepository.findByUsername(data.username);
    }

    return user ? Result.ok(user) : Result.fail();
  }
}
