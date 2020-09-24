import { FunctionType } from './function-type';

export type JobData = Record<string, string>;

export interface JobDataExtended extends JobData {
  url: string;
}

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

export type QueueJobWorker = (job: JobData, done: FunctionType) => void;

export interface QueueJob {
  queuedLinkList: string[];
  createQueue(worker: QueueJobWorker, concurrency?: number): void;
  getQueue(): QueueJobStatic;
}

