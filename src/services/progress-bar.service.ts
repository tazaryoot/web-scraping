import 'reflect-metadata';
import { injectable } from 'inversify';

import { ProgressBar } from '../interfaces/progress-bar';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const Progress3p = require('progress');


interface ProgressBarEntity {
  total: number;
  complete: boolean;

  tick(): void;

  terminate(): void;
}


@injectable()
export class ProgressBarService implements ProgressBar {
  private progress: ProgressBarEntity | undefined;

  start(total: number): void {
    this.progress = new Progress3p(':bar :percent', { total });
  }


  setTotal(total: number): void {
    if (this.progress) {
      this.progress.total = total;
    }
  }


  updateTotal(additionalTotal: number): void {
    if (this.progress) {
      this.progress.total = this.progress.total + additionalTotal;
    }
  }


  stop(): void {
    if (this.progress) {
      this.progress.terminate();
    }
  }


  update(): void {
    if (this.progress) {
      this.progress.tick();
    }
  }

}
