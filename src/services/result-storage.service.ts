import 'reflect-metadata';
import { injectable } from 'inversify';

import { ResultStorage } from '../interfaces/result-storage';
import { Storage } from '../interfaces/storage';


@injectable()
export class ResultStorageService implements Storage<ResultStorage> {
  storage: ResultStorage;


  constructor() {
    this.storage = {
      result: [],
      pageCount: 0,
      itemsCount: 0,
    };
  }


  getDataByKey<K extends keyof ResultStorage>(key: K): ResultStorage[K] {
    return this.storage[key];
  }


  setDataByKey<K extends keyof ResultStorage>(key: K, data: ResultStorage[K]): void {
    this.storage[key] = data;
  }
}
