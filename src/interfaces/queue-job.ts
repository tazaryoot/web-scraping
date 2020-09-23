import { FunctionType } from './function-type';

export type JobData = Record<string, string>;


export interface QueueJobStatic {
  readonly started: boolean;
  idle(): boolean;
  kill(): void;
  length(): number;
  pause(): void;
  push(job: JobData | JobData[], done?: FunctionType): void;
  resume(): void;
  running(): number;
  drain(): void;
  empty(): void;
}

export interface QueueJob {
  tessQueue: (
    worker: (job: JobData, done: FunctionType) => void,
    concurrency?: number,
  ) => QueueJobStatic
}

