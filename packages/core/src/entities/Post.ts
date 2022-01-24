import Community from './Community';
import { PostMedia } from '@fest/shared';
import User from './/User';

export class Post {
  id: string;

  dateCreated: Date;
  dateUpdated: Date;

  communityId: string;
  community?: Community;

  userId: string;
  user: User;

  text: string;
  media?: PostMedia[];

  constructor(data: Partial<Post>) {
    Object.assign(this, data);
  }
}

export default Post;
