export default abstract class Job {
  abstract execute(...params: any): Promise<void>;
}
