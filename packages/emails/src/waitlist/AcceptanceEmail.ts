import Email from '../Email';
import getTemplate from '../getTemplate';

export class AcceptanceEmail extends Email {
  subject = "Congratulations! You're officially in 🎉😎";
  content;

  constructor(to: string, loginUrl: string, isCreator: boolean) {
    super(to);
    this.content = getTemplate('acceptance-email', {
      loginUrl,
      isCreator
    });
  }
}
