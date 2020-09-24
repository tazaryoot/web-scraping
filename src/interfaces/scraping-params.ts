import { ResultItem } from './result-item';

export interface ScrapingParams {
  body: string,
  results: ResultItem[],
  selectorString: string,
  url: string,
  excludeURL: RegExp,
  regexp?: RegExp,
}
