export interface Repository<T> {
  get(id: string, relations?: string[]): Promise<T>;
  create(item: T): Promise<T>;
  update(item: T): Promise<T>;
  remove(item: T): Promise<void>;
}

export default Repository;
