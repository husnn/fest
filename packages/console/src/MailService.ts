import { MailService as IMailService } from '@fest/core';
import { Email } from '@fest/emails';
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
      html: email.build()
    };

    sgMail.send(msg).catch((err: string) => {
      console.log(err);
    });
  }
}

export default MailService;
