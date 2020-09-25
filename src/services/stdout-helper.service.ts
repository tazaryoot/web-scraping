import 'reflect-metadata';
import { injectable } from 'inversify';

import { Direction, StdoutHelper } from '../interfaces/stdout-helper';


@injectable()
export class StdoutHelperService implements StdoutHelper {
  clearLine(dir: Direction = 0): void {
    process.stdout.clearLine(dir);
    process.stdout.cursorTo(0);
  }

}
