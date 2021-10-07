import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { UserRepository } from '../../repositories';

type DoAuthPrecheckInput = {
  email?: string;
};

type DoAuthPrecheckOutput = {
  exists: boolean;
  active: boolean;
};

export class DoAuthPrecheck extends UseCase<
  DoAuthPrecheckInput,
  DoAuthPrecheckOutput
> {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    super();

    this.userRepository = userRepository;
  }

  async exec(data: DoAuthPrecheckInput): Promise<Result<DoAuthPrecheckOutput>> {
    const user = await this.userRepository.findByEmail(data.email);

    return Result.ok({
      exists: !!user,
      active: true
    });
  }
}
