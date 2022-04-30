import UserDTO from './UserDTO';

export class SearchResultDTO {
  users: UserDTO[];

  constructor(data: Partial<SearchResultDTO>) {
    this.users = data.users;
  }
}

export default SearchResultDTO;
