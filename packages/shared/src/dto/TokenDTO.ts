import { TokenFee } from '../types';
import ChainData from '../types/TokenChainData';
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

  chain?: ChainData;
  minted = false;

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

    this.chain = props.chain;
    this.minted = props.minted;
  }
}

export default TokenDTO;
