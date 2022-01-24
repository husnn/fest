import {
  EntitySchema,
  Repository as PostgresRepository,
  getRepository
} from 'typeorm';

import { Repository as IRepository } from '@fest/core';

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

  create(item: T): Promise<T> {
    return this.db.save(item);
  }

  update(item: T): Promise<T> {
    return this.db.save(item);
  }

  async remove(item: T): Promise<void> {
    await this.db.remove(item);
  }
}

export default Repository;
