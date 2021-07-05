import Email from '../base/Email';

export interface MailService {
  send(email: Email): void;
}

export default MailService;
