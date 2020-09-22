import { TressJobData, TressStatic, TressWorkerDoneCallback } from 'tress';

export type TessConstructor = (
  worker: (job: TressJobData, done: TressWorkerDoneCallback) => void,
  concurrency?: number
) => TressStatic;
