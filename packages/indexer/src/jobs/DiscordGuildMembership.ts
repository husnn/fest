import {
  CommunityRepository,
  DiscordService,
  OAuthRepository
} from '@fest/core';
import { OAuthProvider, Result } from '@fest/shared';

import Job from './Job';
import JobData from './JobData';

export interface DiscordGuildMembershipJob extends JobData {
  type: 'add' | 'remove';
  userId: string;
  tokenId: string;
}

export default class DiscordGuildMembership extends Job<DiscordGuildMembershipJob> {
  constructor(props: DiscordGuildMembershipJob) {
    super(props);
  }

  async execute(
    oauthRepository: OAuthRepository,
    communityRepository: CommunityRepository,
    discordService: DiscordService
  ): Promise<void> {
    const action = this.props.type == 'add' ? 'Add' : 'Remove';
    const preposition = this.props.type == 'add' ? 'to' : 'from';

    const oauth = await oauthRepository.findByUser(
      OAuthProvider.DISCORD,
      this.props.userId
    );
    if (!oauth || !oauth.externalId) return;

    const communities = await communityRepository.findByToken(
      this.props.tokenId
    );
    for (const c of communities) {
      if (!c.discordGuildId) continue;

      let result: Result<boolean>;
      if (this.props.type == 'add') {
        result = await discordService.addMember(
          c.discordGuildId,
          oauth.externalId,
          oauth.accessToken
        );
      } else {
        result = await discordService.kickMember(
          c.discordGuildId,
          oauth.externalId
        );
      }
      if (!result.success)
        throw new Error(
          `Could not ${action.toLowerCase()} Discord member ${
            oauth.externalId
          } ${preposition} guild ${c.discordGuildName} (${c.discordGuildId}).`
        );
      // Member not added/removed due to 404 response. Continue.
      if (!result.data) continue;

      console.log(
        `${action} Discord member ${oauth.externalId} ${preposition} guild ${c.discordGuildName} (${c.discordGuildId}).`
      );
    }
  }
}
