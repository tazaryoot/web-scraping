/*jshint esversion: 6 */

const fs = require('fs');
const Json2csvTransform = require('json2csv').Transform;
const iconv = require('iconv-lite');

class Write {
  constructor() {
    let encode = 'win1251';
  }
  startWriteStream(fileName) {
    this.writeStream = fs.createWriteStream(fileName);
  }

  endWriteStream() {
    this.writeStream.end();
  }

  initExport2CSV(params) {
    let {path, fields, unwind, delimiter = ';'} = params;
    const transformOpts = { highWaterMark: 16384, encoding: 'utf8' };

    this.csvInputStream = fs.createReadStream(path + 'result.json');
    this.csvOutputStream = fs.createWriteStream(path  + 'result.csv');
    this.json2csv = new Json2csvTransform({fields, unwind, delimiter}, transformOpts);
  }

  export2Csv() {
    if (!this.csvInputStream) {
      throw Error('!!!!!!!!!init export');
    }
    return this.csvInputStream
      .pipe(iconv.decodeStream('utf8'))
      .pipe(this.json2csv)
      .pipe(iconv.encodeStream(encode))
      .pipe(this.csvOutputStream);
  }

  __pad(n){
    return n < 10 ? '0' + n : n;
  }

  getTime(short) {
    const date = new Date();
    let time = `${date.getFullYear()}-${this.__pad(date.getMonth() + 1)}-${this.__pad(date.getDate())}`;

    if (!short){
      time += `T${this.__pad(date.getHours())}:${this.__pad(date.getMinutes())}:${this.__pad(date.getSeconds())}`;
    }
    return time;
  }

  results(resluts, path = './') {
    return new Promise((resolve, reject) => {
        try {
          fs.writeFileSync(path + 'result.json', JSON.stringify(resluts, null, 4, 'utf-8'));
          resolve();
        } catch (e) {
          reject();
        }
    });
  }

  log(logObj) {
    return new Promise((resolve, reject) => {
        try {
          let {message, logLevel} = logObj;
          this.writeStream.write(`[${this.getTime()}][${logLevel}] ${message}\r\n`);
          resolve();
        } catch (e) {
          reject();
        }
    });
  }

  message(message) {
    return new Promise((resolve, reject) => {
      try {
        this.writeStream.write(`${message}\r\n`);
        resolve();
      } catch(e) {
        reject();
      }
    });
  }

}

module.exports = Write;
