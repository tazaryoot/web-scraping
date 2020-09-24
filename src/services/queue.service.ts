import 'reflect-metadata';
import { injectable } from 'inversify';

import { QueueJob, QueueJobStatic, QueueJobWorker } from '../interfaces/queue-job';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tress = require('tress');


@injectable()
export class Queue implements QueueJob {
  queuedLinkList: string[] = [];

  private queue: QueueJobStatic;


  constructor() {
    this.queue = tress(() => {});
  }


  createQueue(worker: QueueJobWorker, concurrency?: number): void {
    this.queue = tress(worker, concurrency)
  }

  getQueue(): QueueJobStatic {
    return this.queue;
  }
}
