import ChangeEmail from '../../emails/ChangeEmail';
import { EmailAddressChangeError } from './errors';
import { MailService } from '../../services';
import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import { UserRepository } from '../../repositories';
import { emailChangeLink } from '../../config';
import { getExpiryDate } from '@fanbase/shared';

export type RequestEmailAddressChangeInput = {
  userId: string;
  email: string;
};

export type RequestEmailAddressChangeOutput = null;

const JWT_EXPIRY_IN_MINS = 5;

export class RequestEmailAddressChange extends UseCase<
  RequestEmailAddressChangeInput,
  RequestEmailAddressChangeOutput
> {
  private userRepository: UserRepository;
  private mailService: MailService;

  constructor(userRepository: UserRepository, mailService: MailService) {
    super();

    this.userRepository = userRepository;
    this.mailService = mailService;
  }

  async exec(
    data: RequestEmailAddressChangeInput
  ): Promise<Result<RequestEmailAddressChangeOutput>> {
    const user = await this.userRepository.get(data.userId);
    if (!user) return Result.fail();

    const newEmail = data.email.trim().toLowerCase();
    const userForEmail = await this.userRepository.findByEmail(newEmail);

    if (userForEmail) {
      if (user.id == userForEmail.id)
        return Result.fail(EmailAddressChangeError.SAME_EMAIL);
      return Result.fail(EmailAddressChangeError.EMAIL_ALREADY_IN_USE);
    }

    const expiry = getExpiryDate(JWT_EXPIRY_IN_MINS * 60);
    const jwt = User.generateEmailChangeJwt(user, newEmail, JWT_EXPIRY_IN_MINS);

    user.emailChangeToken = {
      value: jwt,
      expiry
    };
    await this.userRepository.update(user);

    this.mailService.send(
      new ChangeEmail(user.email, emailChangeLink(jwt, expiry))
    );

    return Result.ok();
  }
}

export default RequestEmailAddressChange;
