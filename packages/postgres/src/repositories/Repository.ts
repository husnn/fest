import { EntitySchema, getRepository, Repository as PostgresRepository } from 'typeorm';

import { Repository as IRepository } from '@fanbase/core';

export abstract class Repository<T> implements IRepository<T> {
  protected db: PostgresRepository<T>;

  constructor(schema: EntitySchema) {
    this.db = getRepository<T>(schema);
  }

  get(id: string, relations: string[] = []): Promise<T> {
    return this.db.findOne(id, { relations });
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
