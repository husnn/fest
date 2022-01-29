import { Email, WaitlistEntry } from '@fest/core';

import { WaitlistEntryType } from '@fest/shared';
import { appConfig } from '../config';
import { getTemplate } from '@fest/emails';

export class AcceptanceEmail extends Email {
  subject = "Congratulations! You're officially in 🎉😎";
  content;

  constructor(entry: WaitlistEntry) {
    super(entry.email);
    this.content = getTemplate('acceptance-email', {
      loginUrl: `${appConfig.clientUrl}/login`,
      isCreator: entry.type == WaitlistEntryType.CREATOR
    });
  }
}
