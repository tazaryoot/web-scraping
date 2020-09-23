import 'reflect-metadata';
import fs, { WriteStream } from 'fs';
import { injectable } from 'inversify';

import { FileWrite } from '../interfaces/file-write';
import { LoggerParams } from '../interfaces/logger-params';
import { ResultItem } from '../interfaces/result-item';


// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@injectable()
export class FileWriter implements FileWrite {
  private writeStream: WriteStream | undefined;
  private encode: string;


  constructor() {
    this.encode = 'win1251';
  }


  static pad(n: number): string {
    return n < 10 ? `0${n}` : n.toString();
  }


  getTime(short?: boolean): string {
    const date = new Date();
    let time = `${date.getFullYear()}-${FileWriter.pad(date.getMonth() + 1)}-${FileWriter.pad(date.getDate())}`;

    if (!short) {
      time += `T${FileWriter.pad(date.getHours())}:${FileWriter.pad(date.getMinutes())}:${FileWriter.pad(date.getSeconds())}`;
    }
    return time;
  }


  writeResultsFile(results: ResultItem[], path = './'): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fs.writeFileSync(`${path}result.json`, JSON.stringify(results, null, 2, 'utf-8'));
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }


  startWriteStream(fileName: string): void {
    this.writeStream = fs.createWriteStream(fileName, { flags: 'a' });
  }


  endWriteStream(): void {
    if (this.writeStream) {
      this.writeStream.end();
    }
  }


  writeLog(logObj: LoggerParams): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        const { message, logLevel } = logObj;
        if (this.writeStream) {
          this.writeStream.write(`[${this.getTime()}][${logLevel}] ${message}\r\n`);
        }

        resolve();
      } catch (e) {
        console.error(`Write log error`, e);
        reject(e);
      }
    });
  }


  writeMessageInStream(message: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        if (this.writeStream) {
          this.writeStream.write(`${message}\r\n`);
        } else {
          throw new Error('writeStream undefined')
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
}
