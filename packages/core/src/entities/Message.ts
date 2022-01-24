import { Community, Room } from '.';

import { MessageType } from '@fest/shared';

type MediaResolution = 'small' | 'regular' | 'high';

type MessageMedia = {
  variations: Array<{
    resolution: MediaResolution;
    url: string;
  }>;
  sourceUrl: string;
  isVideo: boolean;
};

export class Message {
  id: string;

  dateCreated: Date;
  dateUpdated: Date;

  communityId: string;
  community: Community;

  rooms?: Room[];

  type: MessageType;
  parentId?: string;

  userId: string;

  text: string;
  media: MessageMedia[];
}

export default Message;
