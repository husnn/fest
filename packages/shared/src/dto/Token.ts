export interface IToken {
  id: string;
  dateCreated: Date;
  creator?: string;
  name?: string;
  description?: string;
  supply?: number;
}

export class Token implements IToken {
  id: string;
  dateCreated: Date;
  creator?: string;
  name?: string;
  description?: string;
  supply?: number;

  constructor(props: IToken) {
    this.id = props.id;
    this.dateCreated = props.dateCreated;
    this.creator = props.creator;
    this.name = props.name;
    this.description = props.description;
    this.supply = props.supply;
  }
}
