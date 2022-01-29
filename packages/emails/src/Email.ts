export abstract class Email {
  to: string;

  abstract subject: string;
  abstract content: string;

  constructor(to: string) {
    this.to = to;
  }
}

export default Email;
