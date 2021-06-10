import Email from '../base/Email';

export class LoginCodeEmail extends Email {
  subject: string;
  content: string;

  constructor(to: string, code: string) {
    super(to);

    this.subject = 'Login to Fanbase';

    this.content = `
      Your login code is ${code}
    `;
  }
}

export default LoginCodeEmail;
