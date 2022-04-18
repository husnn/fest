import Email from '../Email';
export class AcceptanceEmail extends Email {
  subject = "😎 You're officially in";
  content;

  constructor(
    to: string,
    loginUrl: string,
    isCreator: boolean,
    walletAddress?: string
  ) {
    super(to, 'waitlist-acceptance', {
      loginUrl,
      isCreator,
      walletAddress
    });
  }
}
