import TokenDTO from './TokenDTO';
import TokenOwnershipDTO from './TokenOwnershipDTO';

export class TokenOwnedDTO extends TokenDTO {
  ownership: TokenOwnershipDTO;

  constructor(props: TokenOwnedDTO) {
    super(props);

    this.ownership = new TokenOwnershipDTO(props.ownership);
  }
}

export default TokenDTO;
