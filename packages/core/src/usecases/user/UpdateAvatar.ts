import { UserDTO } from '@fest/shared';
import UseCase from '../../base/UseCase';
import { UserRepository } from '../../repositories';
import Result from '../../Result';

type UpdateAvatarInput = {
  user: string;
  url: string;
};

type UpdateAvatarOutput = UserDTO;

export class UpdateAvatar extends UseCase<
  UpdateAvatarInput,
  UpdateAvatarOutput
> {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    super();

    this.userRepository = userRepository;
  }

  async exec(data: UpdateAvatarInput): Promise<Result<UpdateAvatarOutput>> {
    try {
      const updated = await this.userRepository.update({
        id: data.user,
        avatar: data.url
      });

      return Result.ok<UpdateAvatarOutput>(new UserDTO(updated));
    } catch (err) {
      console.log(err);
      return Result.fail();
    }
  }
}
