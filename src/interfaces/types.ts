import { ExecutionTime } from './execution-time';

const TYPES = {
  FileWrite: Symbol.for('FileWrite'),
  Main: Symbol.for('Main'),
  Scrapper: Symbol.for('Scrapper'),
  QueueJob: Symbol.for('QueueJob'),
  HttpClient: Symbol.for('HttpClient'),
  ExecutionTime: Symbol.for('ExecutionTime'),
}

export { TYPES };
