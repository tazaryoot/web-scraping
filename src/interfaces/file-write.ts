import { LoggerParams } from './logger-params';
import { ResultItem } from './result-item';


export interface FileWrite {
  writeResultsFile(results: ResultItem[], path: string): Promise<unknown>;

  startWriteStream(fileName: string): void;

  endWriteStream(): void;

  writeLog(logObj: LoggerParams): Promise<unknown>;

  writeMessageInStream(message: string): Promise<unknown>;

  getTime(short?: boolean): string;
}
