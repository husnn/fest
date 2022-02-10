import JobData from './JobData';

export default abstract class Job<T extends JobData> {
  props: T;

  constructor(props: T) {
    this.props = props;
  }

  abstract execute(...params: any): Promise<void>;
}
