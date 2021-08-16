export default abstract class Job<JobData> {
  props: JobData;

  constructor(props: JobData) {
    this.props = props;
  }

  abstract execute(...params: any): Promise<void>;
}
