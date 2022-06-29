import Token from './Token';
import User from './User';

export class Community {
  readonly id: string;

  creatorId: string;
  creator: User;

  name: string;

  discordGuildId?: string;
  discordGuildName?: string;

  tokens: Token[];
  users: User[];

  constructor(data?: Partial<Community>) {
    Object.assign(this, data);
  }
}

export default Community;
