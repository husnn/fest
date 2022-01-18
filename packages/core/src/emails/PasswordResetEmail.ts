import Email from '../base/Email';

export class PasswordResetEmail extends Email {
  subject: string;
  content: string;

  constructor(to: string, resetLink: string) {
    super(to);

    this.subject = 'Reset your password';

    this.content = `
      Click the following link to reset your password:
      <a href="${resetLink}">${resetLink}</a>
    `;
  }
}

export default PasswordResetEmail;
