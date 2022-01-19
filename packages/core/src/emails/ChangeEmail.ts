import Email from '../base/Email';

export class ChangeEmail extends Email {
  subject: string;
  content: string;

  constructor(to: string, changeLink: string) {
    super(to);

    this.subject = 'Change email address';

    this.content = `
      Click the following link to change your email address:
      <a href="${changeLink}">${changeLink}</a>
    `;
  }
}

export default ChangeEmail;
