import { Express, NextFunction, Request, Response } from 'express';

import { AcceptanceEmail } from './AcceptanceEmail';
import { MailService } from '@fanbase/core';
import { WaitlistRepository } from '@fanbase/postgres';
import moment from 'moment';

export default (
  app: Express,
  waitlistRepository: WaitlistRepository,
  mailService: MailService
) => {
  app.get(
    '/waitlist',
    async (req: Request, res: Response, next: NextFunction) => {
      const query = await waitlistRepository.getAll();
      res.render('waitlist', {
        title: 'Welcome',
        entries: query.entries,
        moment: moment
      });
    }
  );

  app.post(
    '/waitlist/:id/accept',
    async (req: Request, res: Response, next: NextFunction) => {
      const entry = await waitlistRepository.get(req.params.id);
      if (entry.isAccepted) return next();
      entry.isAccepted = true;
      entry.dateAccepted = new Date();
      waitlistRepository.update(entry);
      const email = new AcceptanceEmail(entry);
      mailService.send(email);
      res.end();
    }
  );
};
