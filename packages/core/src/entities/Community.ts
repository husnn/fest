import Token from './Token';
import User from './User';

export class Community {
  readonly id: string;

  creatorId: string;
  creator: User;

  name: string;

  tokens: Token[];

  constructor(data?: Partial<Community>) {
    Object.assign(this, data);
  }
}

export default Community;
