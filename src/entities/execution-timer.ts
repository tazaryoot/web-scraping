import 'reflect-metadata';
import { injectable } from 'inversify';

import { ExecutionTime, ExecutionTimeResult } from '../interfaces/execution-time';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const perf = require('execution-time');


@injectable()
export class ExecutionTimer implements ExecutionTime {
  private executionTime: ExecutionTime;


  constructor() {
    this.executionTime = perf() as ExecutionTime;
  }


  start(): void {
    this.executionTime.start();
  }


  stop(): ExecutionTimeResult {
    return this.executionTime.stop();
  }

}
