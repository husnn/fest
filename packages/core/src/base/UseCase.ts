import { Result } from '../Result';
import Input from './Input';
import Output from './Output';

export default abstract class UseCase<T extends Input, U extends Output> {
  abstract exec(data: T): Promise<Result<U>>;
}
