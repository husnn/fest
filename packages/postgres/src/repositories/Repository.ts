import { Repository as IRepository } from '@fest/core';
import {
  EntitySchema,
  getRepository,
  Repository as PostgresRepository
} from 'typeorm';

export abstract class Repository<T> implements IRepository<T> {
  protected db: PostgresRepository<T>;

  constructor(schema: EntitySchema) {
    this.db = getRepository<T>(schema);
  }

  get(id: string | number, relations?: string[]): Promise<T> {
    return this.db.findOne(id, { relations });
  }

  getBatch(ids: string[] | number[]): Promise<T[]> {
    return this.db.findByIds(ids);
  }

  create(item: any): Promise<T> {
    return this.db.save(item);
  }

  update(item: any): Promise<T> {
    return this.db.save(item);
  }

  async remove(item: T): Promise<void> {
    await this.db.remove(item);
  }
}

export default Repository;
