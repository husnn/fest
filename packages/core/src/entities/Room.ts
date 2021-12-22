import Community from './Community';
import Message from './Message';

export class Room {
  id: string;

  communityId: string;
  community: Community;

  name: string;

  messages: Message[];
}

export default Room;
