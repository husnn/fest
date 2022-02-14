import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { fromContainerMetadata } from '@aws-sdk/credential-providers';
import { Email, MailService as IMailService } from '@fest/core';
import { mailConfig } from '../config';

class MailService implements IMailService {
  private ses: SESClient;

  constructor() {
    this.ses = new SESClient({
      ...(process.env.ECS_CONTAINER_METADATA_URI_V4 && {
        credentials: fromContainerMetadata()
      }),
      region: process.env.MEDIA_S3_REGION || 'us-east-1'
    });
  }

  send(email: Email) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(email.content);
      return;
    }

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [email.to]
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: email.content
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: email.subject
        }
      },
      Source: `Fest <${mailConfig.from.noreply}>`
    });

    this.ses.send(command).catch((err) => console.log(err));
  }
}

export default MailService;
