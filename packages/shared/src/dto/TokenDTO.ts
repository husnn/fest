import { CommunityDTO } from '.';
import { TokenType } from '..';
import ChainData from '../types/TokenChainData';
import { UserDTO } from './UserDTO';

export class TokenDTO {
  id: string;

  type: TokenType;

  dateCreated: Date;

  creatorId: string;
  creator?: UserDTO;

  name: string;
  description?: string;
  supply?: number;

  royaltyPct?: number;

  image?: string;

  mediaUri?: string;
  metadataUri?: string;

  attributes?: {
    [name: string]: string;
  };

  externalUrl?: string;
  youtubeUrl?: string;

  chain?: ChainData;
  minted = false;

  communities?: CommunityDTO[];

  constructor(props: TokenDTO) {
    this.id = props.id;
    this.type = props.type;
    this.dateCreated = props.dateCreated;

    this.creatorId = props.creatorId;

    if (props.creator) {
      this.creator = new UserDTO(props.creator);
    }

    this.name = props.name;
    this.description = props.description;
    this.supply = props.supply;

    this.royaltyPct = props.royaltyPct;

    this.image = props.image;

    this.mediaUri = props.mediaUri;
    this.metadataUri = props.metadataUri;

    this.attributes = props.attributes;

    if (props.type == TokenType.YT_VIDEO) this.youtubeUrl = props.externalUrl;

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
