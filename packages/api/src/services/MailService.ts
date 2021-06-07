import { Email, MailService as IMailService } from '@fanbase/core';

class MailService implements IMailService {
  send (email: Email): void {
    console.log(email.content);
  }
}

export default MailService;
