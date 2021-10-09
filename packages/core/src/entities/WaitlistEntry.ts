import { WaitlistEntryType } from '@fanbase/shared';

export class WaitlistEntry {
  readonly id: string;

  entryDate: Date;

  type: WaitlistEntryType;

  email: string;
  wallet: string;
  socialMedia: string;

  isAccepted: boolean;

  constructor(data?: Partial<WaitlistEntry>) {
    Object.assign(this, data);
  }
}

export default WaitlistEntry;
