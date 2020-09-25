import { ResultItem } from './result-item';

export interface ResultStorage {
  result: ResultItem[];
  pageCount: number;
  itemsCount: number;
}
