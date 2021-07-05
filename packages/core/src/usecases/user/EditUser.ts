import { CurrentUserDTO } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { mapUserToCurrentDTO } from '../../mappers';
import { UserRepository, WalletRepository } from '../../repositories';
import { Result } from '../../Result';

type EditUserInput = {
  user: string;
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
};

type EditUserOutput = {
  user: CurrentUserDTO;
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
    const { name, username, email, bio } = data;

    const user = await this.userRepository.get(data.user);

    const original = Object.assign({}, user);

    if (name) user.name = name.trim(); // @BeforeInsert Trim
    if (username) user.username = username.trim(); // @BeforeInsert Trim and validate
    if (email) user.email = email.trim().toLowerCase(); // @BeforeInsert Trim and validate
    if (bio) user.bio = bio.trim(); // @BeforeInsert Trim and validate

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
