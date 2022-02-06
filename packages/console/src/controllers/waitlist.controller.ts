import { Express, NextFunction, Request, Response } from 'express';
import {
  MailService,
  WaitlistRepository,
  UserRepository,
  InviteRepository
} from '@fest/core';

import { AcceptanceEmail } from '@fest/emails';
import { WaitlistEntryType } from '@fest/shared';
import { appConfig } from '../config';
import moment from 'moment';
import { upgradeInvitesToCreator } from '@fest/core';

export default (
  app: Express,
  userRepository: UserRepository,
  inviteRepository: InviteRepository,
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

      const user = await userRepository.findByEmailOrWallet(
        entry.wallet ? entry.wallet : entry.email
      );
      if (user && !user.isCreator && entry.type == WaitlistEntryType.CREATOR) {
        user.isCreator = true;
        userRepository.update(user);

        upgradeInvitesToCreator(inviteRepository, user.id);
      }

      entry.isAccepted = true;
      entry.dateAccepted = new Date();

      waitlistRepository.update(entry);

      const email = new AcceptanceEmail(
        entry.email,
        `${appConfig.clientUrl}/login`,
        entry.type == WaitlistEntryType.CREATOR
      );

      mailService.send(email);
      res.end();
    }
  );
};
