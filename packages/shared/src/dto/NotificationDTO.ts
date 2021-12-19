export class NotificationDTO {
  text: string;

  constructor(data: Partial<NotificationDTO>) {
    this.text = data.text;
  }
}
