import { FunctionType } from './function-type';

export interface ExecutionTimeResult {
  verboseWords: string;
  [name: string]: string;
}

export interface ExecutionTime {
  start: FunctionType;
  stop: () => ExecutionTimeResult;
}
