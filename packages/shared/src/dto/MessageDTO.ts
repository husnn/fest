import { MessageType } from '..';

export class MessageDTO {
  communityId: string;
  roomId: string;

  type: MessageType;
  text: string;

  constructor(data: Partial<MessageDTO>) {
    this.communityId = data.communityId;
    this.roomId = data.roomId;
    this.type = data.type;
    this.text = data.text;
  }
}

export default MessageDTO;
