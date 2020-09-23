import { QueueJobStatic } from './queue-job';
import { ResultItem } from './result-item';

export interface ScrapingParams {
  response: any,
  queue: QueueJobStatic,
  results: ResultItem[],
  selectorString: string,
  url: string,
  excludeURL: RegExp,
  progressBar: any,
  regexp?: RegExp,
}
