import Email from '../base/Email';

export class OfferReceivedEmail extends Email {
  subject: string;
  content: string;

  constructor(to: string, offerId: string) {
    super(to);

    this.subject = 'You received an offer';

    this.content = `
      ${offerId}
    `;
  }
}

export default OfferReceivedEmail;
