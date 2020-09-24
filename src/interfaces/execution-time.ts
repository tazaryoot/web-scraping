export interface ExecutionTimeResult {
  verboseWords: string;
  [name: string]: string;
}

export interface ExecutionTime {
  start(): void;
  stop(): ExecutionTimeResult;
}
