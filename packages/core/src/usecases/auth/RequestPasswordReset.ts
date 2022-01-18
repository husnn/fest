import { MailService } from '../../services';
import { PasswordResetEmail } from '../../emails';
import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import { UserRepository } from '../../repositories';
import { getExpiryDate } from '@fanbase/shared';
import { passwordResetLink } from '../../config';

type RequestPasswordResetInput = {
  email: string;
};

type RequestPasswordResetOutput = boolean;

const JWT_EXPIRY_IN_MINS = 5;

export class RequestPasswordReset extends UseCase<
  RequestPasswordResetInput,
  RequestPasswordResetOutput
> {
  private userRepository: UserRepository;
  private mailService: MailService;

  constructor(userRepository: UserRepository, mailService: MailService) {
    super();

    this.userRepository = userRepository;
    this.mailService = mailService;
  }

  async exec(
    data: RequestPasswordResetInput
  ): Promise<Result<RequestPasswordResetOutput>> {
    const user = await this.userRepository.findByEmail(
      data.email.trim().toLowerCase()
    );
    if (!user) return Result.fail();

    const expiry = getExpiryDate(JWT_EXPIRY_IN_MINS * 60);
    const jwt = User.generateResetJwt(user, JWT_EXPIRY_IN_MINS);

    user.passwordResetToken = {
      value: jwt,
      expiry
    };
    await this.userRepository.update(user);

    this.mailService.send(
      new PasswordResetEmail(user.email, passwordResetLink(jwt, expiry))
    );

    return Result.ok(true);
  }
}
