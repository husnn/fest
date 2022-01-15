export class PostDTO {
  id: string;

  communityId: string;
  userId: string;

  text: string;

  constructor(data: Partial<PostDTO>) {
    this.id = data.id;

    this.communityId = data.communityId;
    this.userId = data.userId;

    this.text = data.text;
  }
}
