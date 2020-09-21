import { TressStatic } from 'tress';
import { ResultItem } from './result-item';

export interface ScrapingParams {
  response: any,
  queue: TressStatic,
  results: ResultItem[],
  selectorString: string,
  url: string,
  excludeURL: RegExp,
  progressBar: any,
  regexp?: RegExp,
}
