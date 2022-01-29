import { Email, MailService as IMailService } from '@fest/core';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

import { mailConfig } from './config';

sgMail.setApiKey(mailConfig.sendgrid.apiKey);

export class MailService implements IMailService {
  send(email: Email) {
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
