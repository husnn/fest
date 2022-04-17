export interface Repository<T> {
  get(id: string | number, relations?: string[]): Promise<T>;
  getBatch(ids: Array<string | number>): Promise<T[]>;
  create(item: T): Promise<T>;
  update(item: Partial<T>): Promise<T>;
  remove(item: T): Promise<void>;
}

export default Repository;
