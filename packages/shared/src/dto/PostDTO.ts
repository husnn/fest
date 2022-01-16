import { CommunityDTO, UserDTO } from '.';

import { PostMedia } from '../types';

export class PostDTO {
  id: string;

  dateCreated: Date;

  communityId: string;
  community: CommunityDTO;

  userId: string;
  user: UserDTO;

  media: PostMedia[];

  text: string;

  constructor(data: Partial<PostDTO>) {
    this.id = data.id;

    this.dateCreated = data.dateCreated;

    this.communityId = data.communityId;
    if (data.community) this.community = new CommunityDTO(data.community);

    this.userId = data.userId;
    if (data.user) this.user = new UserDTO(data.user);

    if (data.media) this.media = data.media;

    this.text = data.text;
  }
}
