import { CurrentUser } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { mapUserToCurrentDTO } from '../../mappers';
import { UserRepository, WalletRepository } from '../../repositories';
import { Result } from '../../Result';

type EditUserInput = {
  user: string;
  name?: string;
  username?: string;
  email?: string;
};

type EditUserOutput = {
  user: CurrentUser;
};

export class EditUser extends UseCase<EditUserInput, EditUserOutput> {
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

  async exec(data: EditUserInput): Promise<Result<EditUserOutput>> {
    const { name, username, email } = data;

    let user = await this.userRepository.get(data.user);

    const original = Object.assign({}, user);

    if (name) user.name = name;
    if (username) user.username = username;
    if (email) user.email = email;

    if (JSON.stringify(original) !== JSON.stringify(user)) {
      await this.userRepository.update(user);
    }

    user.wallet = await this.walletRepository.get(user.walletId);

    return Result.ok({
      user: mapUserToCurrentDTO(user)
    });
  }
}

export default EditUser;
