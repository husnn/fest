import { Email, WaitlistEntry } from '@fest/core';

import { WaitlistEntryType } from '@fest/shared';
import getEmailTemplate from '../getEmailTemplate';

export class AcceptanceEmail extends Email {
  subject = "Congratulations! You're officially in 🎉😎";
  content;

  constructor(entry: WaitlistEntry) {
    super(entry.email);
    this.content = getEmailTemplate('acceptance-email', {
      loginUrl: `${process.env.CLIENT_URL}/login`,
      isCreator: entry.type == WaitlistEntryType.CREATOR
    });
  }
}
