import { ReadStream, WriteStream } from 'fs';

import { ExportToCsvParams } from '../interfaces/export-to-csv-params';
import { LoggerParams } from '../interfaces/logger-params';

const fs = require('fs');
const Json2csvTransform = require('json2csv').Transform;
const iconv = require('iconv-lite');

export class FileWriter {
  private writeStream: WriteStream | undefined;
  private encode: string;
  private csvInputStream: ReadStream | undefined;
  private csvOutputStream: WriteStream | undefined;
  private json2csv: any;

  constructor() {
    this.encode = 'win1251';
  }

  startWriteStream(fileName: string) {
    this.writeStream = fs.createWriteStream(fileName, { flags: 'a' });
  }

  endWriteStream() {
    if (this.writeStream) {
      this.writeStream.end();
    }
  }

  initExport2CSV(params: ExportToCsvParams) {
    const {
      path, fields, unwind, delimiter = ';',
    } = params;
    const transformOpts = { highWaterMark: 16384, encoding: 'utf8' };

    this.csvInputStream = fs.createReadStream(`${path}result.json`);
    this.csvOutputStream = fs.createWriteStream(`${path}result.csv`);
    this.json2csv = new Json2csvTransform({ fields, unwind, delimiter }, transformOpts);
  }

  export2Csv() {
    if (!this.csvInputStream || !this.csvOutputStream) {
      throw Error('!!!!!!!!!init export');
    }
    return this.csvInputStream
      .pipe(iconv.decodeStream('utf8'))
      .pipe(this.json2csv)
      .pipe(iconv.encodeStream(this.encode))
      .pipe(this.csvOutputStream);
  }

  writeLog(logObj: LoggerParams) {
    return new Promise((resolve, reject) => {
      try {
        const { message, logLevel } = logObj;
        if (this.writeStream) {
          this.writeStream.write(`[${FileWriter.getTime()}][${logLevel}] ${message}\r\n`);
        }

        resolve();
      } catch (e) {
        reject();
      }
    });
  }

  writeMessageInStream(message: string) {
    return new Promise((resolve, reject) => {
      try {
        if (this.writeStream) {
          this.writeStream.write(`${message}\r\n`);
        } else {
          throw new Error('writeStream undefined')
        }
        resolve();
      } catch (e) {
        reject();
      }
    });
  }

  static pad(n: number) {
    return n < 10 ? `0${n}` : n;
  }

  static getTime(short?: boolean) {
    const date = new Date();
    let time = `${date.getFullYear()}-${FileWriter.pad(date.getMonth() + 1)}-${FileWriter.pad(date.getDate())}`;

    if (!short) {
      time += `T${FileWriter.pad(date.getHours())}:${FileWriter.pad(date.getMinutes())}:${FileWriter.pad(date.getSeconds())}`;
    }
    return time;
  }

  static writeResultsFile(results: Record<string, string>, path = './') {
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore
        fs.writeFileSync(`${path}result.json`, JSON.stringify(results, null, 4, 'utf-8'));
        resolve();
      } catch (e) {
        reject();
      }
    });
  }
}
