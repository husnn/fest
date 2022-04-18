import { MailService as IMailService } from '@fest/core';
import { Email } from '@fest/emails';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { isDev, mailConfig } from '../config';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class MailService implements IMailService {
  send(email: Email) {
    if (isDev) console.log(email.props);

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
