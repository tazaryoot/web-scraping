import { ResultItem } from './result-item';

export interface ScrapingParams {
  res: any,
  queue: any,
  results: ResultItem[],
  selectorString: string,
  url: string,
  excludeURL: string,
  progressBar: any,
  regexp: RegExp,
}
