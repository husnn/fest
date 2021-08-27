export class YouTubeChannel {
  id: string;
  contentDetails: {
    relatedPlaylists: {
      [name: string]: string;
    };
  };

  constructor(props: Partial<YouTubeChannel>) {
    this.id = props.id;
    this.contentDetails = props.contentDetails;
  }
}

export default YouTubeChannel;
