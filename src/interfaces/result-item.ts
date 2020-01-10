import { ResultTagItem } from './result-tag-item';

export interface ResultItem {
  page: string;
  title: string;
  path?: string[];
  tags: ResultTagItem[];
}
