import { Email, MailService as IMailService } from '@fanbase/core';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

import { mailConfig } from '../config';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class MailService implements IMailService {
  send(email: Email) {
    if (process.env.NODE_ENV !== 'production') console.log(email.content);

    const msg: MailDataRequired = {
      to: email.to,
      from: mailConfig.from.noreply,
      subject: email.subject,
      text: email.content
    };

    sgMail.send(msg);
  }
}

export default MailService;
