export interface Storage<T> {
  storage: T;
  getDataByKey<K extends keyof T>(key: K): T[K];
  setDataByKey<K extends keyof T>(key: K, data: T[K]): void;
}
