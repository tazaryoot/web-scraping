import { ResultItem } from './result-item';

export interface ScrapingParams {
  response: any,
  queue: any,
  results: ResultItem[],
  selectorString: string,
  url: string,
  excludeURL: RegExp,
  progressBar: any,
  regexp?: RegExp,
}