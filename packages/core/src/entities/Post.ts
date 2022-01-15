import Community from './Community';
import User from './/User';

type MediaResolution = 'small' | 'regular' | 'high';

type PostMedia = {
  variations: Array<{
    resolution: MediaResolution;
    url: string;
  }>;
  sourceUrl: string;
  isVideo: boolean;
};

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
