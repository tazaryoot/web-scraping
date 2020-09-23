import 'reflect-metadata';
import { injectable } from 'inversify';

import { QueueJob } from '../interfaces/queue-job';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tress = require('tress');


@injectable()
export class Queue implements QueueJob {
  tessQueue = tress
}
