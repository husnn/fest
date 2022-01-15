import { CommunityDTO, UserDTO } from '.';

export class PostDTO {
  id: string;

  dateCreated: Date;

  communityId: string;
  community: CommunityDTO;

  userId: string;
  user: UserDTO;

  text: string;

  constructor(data: Partial<PostDTO>) {
    this.id = data.id;

    this.dateCreated = data.dateCreated;

    this.communityId = data.communityId;
    if (data.community) this.community = new CommunityDTO(data.community);

    this.userId = data.userId;
    if (data.user) this.user = new UserDTO(data.user);

    this.text = data.text;
  }
}
