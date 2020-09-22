import { FunctionType } from './function-type';

export interface ExecutionTime {
  start: FunctionType,
  stop: () => Record<string, string>,
}
