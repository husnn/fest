import { User as UserDTO } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import { mapUserToDTO } from '../../mappers';
import { UserRepository, WalletRepository } from '../../repositories';
import { Result } from '../../Result';

export interface GetUserInput {
  id?: string;
  username?: string;
}

export type GetUserOutput = UserDTO;

export class GetUser extends UseCase<GetUserInput, GetUserOutput> {
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository
  ) {
    super();
    this.userRepository = userRepository;
    this.walletRepository = walletRepository;
  }

  async exec(data: GetUserInput): Promise<Result<GetUserOutput>> {
    let user: User;

    if (data.id) {
      user = await this.userRepository.get(data.id);
    } else if (data.username) {
      user = await this.userRepository.findByUsername(data.username);
    }

    if (!user) return Result.fail();

    user.wallet = await this.walletRepository.get(user.walletId);

    return Result.ok(mapUserToDTO(user));
  }
}
