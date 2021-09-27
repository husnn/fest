import ChainData from '../types/TokenChainData';
import { CommunityDTO } from '.';
import { TokenFee } from '../types';
import { UserDTO } from './UserDTO';

export class TokenDTO {
  id: string;

  dateCreated: Date;

  creatorId: string;
  creator?: UserDTO;

  name: string;
  description?: string;
  supply?: number;

  fees?: TokenFee[];

  image?: string;

  metadataUri: string;

  chain?: ChainData;
  minted = false;

  communities?: CommunityDTO[];

  constructor(props: TokenDTO) {
    this.id = props.id;
    this.dateCreated = props.dateCreated;

    this.creatorId = props.creatorId;

    if (props.creator) {
      this.creator = new UserDTO(props.creator);
    }

    this.name = props.name;
    this.description = props.description;
    this.supply = props.supply;

    this.fees = props.fees;

    this.image = props.image;

    this.metadataUri = props.metadataUri;

    this.chain = props.chain;
    this.minted = props.minted;

    if (props.communities) {
      this.communities = props.communities.map(
        (community) => new CommunityDTO(community)
      );
    }
  }
}

export default TokenDTO;
