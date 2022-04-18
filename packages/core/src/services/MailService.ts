import { Email } from '@fest/emails';

export interface MailService {
  send(email: Email): void;
}

export default MailService;
