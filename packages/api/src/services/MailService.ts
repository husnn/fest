import { Email, MailService as IMailService } from '@fest/core';
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
      from: {
        name: 'Fest',
        email: mailConfig.from.noreply
      },
      to: email.to,
      subject: email.subject,
      html: email.content
    };

    sgMail.send(msg).catch((err: string) => {
      console.log(err);
    });
  }
}

export default MailService;
