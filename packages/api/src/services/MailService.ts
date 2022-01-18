import { Email, MailService as IMailService } from '@fanbase/core';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

import { mailConfig } from '../config';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class MailService implements IMailService {
  send(email: Email) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(email.content);
      return;
    }

    const msg: MailDataRequired = {
      to: email.to,
      from: mailConfig.from.noreply,
      subject: email.subject,
      html: email.content
    };

    sgMail.send(msg).catch((err: string) => {
      console.log(err);
    });
  }
}

export default MailService;
