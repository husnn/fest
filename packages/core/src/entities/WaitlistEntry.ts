import { WaitlistEntryType } from '@fest/shared';

export class WaitlistEntry {
  readonly id: string;

  entryDate: Date;

  type: WaitlistEntryType;

  email: string;
  wallet: string;
  socialMedia: string;

  isAccepted: boolean;
  dateAccepted: Date;

  constructor(data?: Partial<WaitlistEntry>) {
    Object.assign(this, data);
  }
}

export default WaitlistEntry;
