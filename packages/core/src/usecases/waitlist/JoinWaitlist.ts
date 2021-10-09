import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { WaitlistEntry } from '../../entities/WaitlistEntry';
import { WaitlistEntryType } from '@fanbase/shared';
import { WaitlistRepository } from '../../repositories';

type JoinWaitlistInput = {
  type: WaitlistEntryType;
  email: string;
  wallet?: string;
  social?: string;
};
type JoinWaitlistOutput = {
  entry: WaitlistEntry;
};

export class JoinWaitlist extends UseCase<
  JoinWaitlistInput,
  JoinWaitlistOutput
> {
  private waitlistRepository: WaitlistRepository;

  constructor(waitlistRepository: WaitlistRepository) {
    super();

    this.waitlistRepository = waitlistRepository;
  }

  async exec(data: JoinWaitlistInput): Promise<Result<JoinWaitlistOutput>> {
    let entry = await this.waitlistRepository.findByEmailOrWallet(data.email);

    if (!entry) {
      entry = await this.waitlistRepository.findByEmailOrWallet(data.wallet);
    }

    if (entry) {
      let updated = false;

      if (
        entry.type === WaitlistEntryType.NORMAL &&
        data.type === WaitlistEntryType.CREATOR
      ) {
        entry.type = data.type;
        updated = true;
      }

      if (!entry.wallet && data.wallet) {
        entry.wallet = data.wallet;
        updated = true;
      }

      if (!entry.socialMedia && data.social) {
        entry.socialMedia = data.social;
        updated = true;
      }

      if (!updated) return Result.fail();

      entry = await this.waitlistRepository.update(entry);
    } else {
      entry = new WaitlistEntry({
        type: data.type,
        email: data.email,
        wallet: data.wallet?.toLowerCase(),
        socialMedia: data.social
      });

      entry = await this.waitlistRepository.create(entry);
    }

    return Result.ok({ entry });
  }
}

export default JoinWaitlist;
