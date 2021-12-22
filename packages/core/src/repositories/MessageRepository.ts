import Message from '../entities/Message';
import { Repository } from '.';

export interface MessageRepository extends Repository<Message> {}
