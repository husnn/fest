import Input from './Input';
import Output from './Output';
import { Result } from '@fest/shared';

export default abstract class UseCase<T extends Input, U extends Output> {
  abstract exec(data: T): Promise<Result<U>>;
}
