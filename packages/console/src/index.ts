import { appConfig, postgresConfig } from './config';

import { MailService } from './MailService';
import Postgres from '@fanbase/postgres';
import { WaitlistRepository } from '@fanbase/postgres';
import express from 'express';
import waitlist from './waitlist/waitlist.controller';

const app = express();

const { protocol, host, port } = appConfig;

(async () => {
  await Postgres.init(postgresConfig);
  console.log('Connected to database.');

  app.set('view engine', 'pug');

  const waitlistRepository = new WaitlistRepository();
  const mailService = new MailService();
  waitlist(app, waitlistRepository, mailService);

  app
    .listen(port, host, () => {
      console.log(`App running at ${protocol}://${host}:${port}`);
    })
    .on('error', (err) => {
      console.log(`Could not start app. ${err}`);
    });
})();
