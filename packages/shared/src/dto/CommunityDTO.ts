import { UserDTO } from './UserDTO';

export class CommunityDTO {
  id: string;

  creatorId: string;
  creator: UserDTO;

  name: string;

  constructor(props: Partial<CommunityDTO>) {
    this.id = props.id;

    this.creatorId = props.creatorId;
    if (props.creator) {
      this.creator = new UserDTO(props.creator);
    }

    this.name = props.name;
  }
}
