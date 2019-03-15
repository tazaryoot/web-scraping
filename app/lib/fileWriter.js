const fs = require('fs');
const Json2csvTransform = require('json2csv').Transform;
const iconv = require('iconv-lite');

class FileWriter {
  constructor() {
    this.encode = 'win1251';
  }

  startWriteStream(fileName) {
    this.writeStream = fs.createWriteStream(fileName);
  }

  endWriteStream() {
    this.writeStream.end();
  }

  initExport2CSV(params) {
    const {
      path, fields, unwind, delimiter = ';',
    } = params;
    const transformOpts = { highWaterMark: 16384, encoding: 'utf8' };

    this.csvInputStream = fs.createReadStream(`${path}result.json`);
    this.csvOutputStream = fs.createWriteStream(`${path}result.csv`);
    this.json2csv = new Json2csvTransform({ fields, unwind, delimiter }, transformOpts);
  }

  export2Csv() {
    if (!this.csvInputStream) {
      throw Error('!!!!!!!!!init export');
    }
    return this.csvInputStream
      .pipe(iconv.decodeStream('utf8'))
      .pipe(this.json2csv)
      .pipe(iconv.encodeStream(this.encode))
      .pipe(this.csvOutputStream);
  }

  pad(n) {
    return n < 10 ? `0${n}` : n;
  }

  getTime(short) {
    const date = new Date();
    let time = `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;

    if (!short) {
      time += `T${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`;
    }
    return time;
  }

  writeResultsFile(results, path = './') {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(`${path}result.json`, JSON.stringify(results, null, 4, 'utf-8'));
        resolve();
      } catch (e) {
        reject();
      }
    });
  }

  writeLog(logObj) {
    return new Promise((resolve, reject) => {
      try {
        const { message, logLevel } = logObj;
        this.writeStream.write(`[${this.getTime()}][${logLevel}] ${message}\r\n`);
        resolve();
      } catch (e) {
        reject();
      }
    });
  }

  writeMessageInStream(message) {
    return new Promise((resolve, reject) => {
      try {
        this.writeStream.write(`${message}\r\n`);
        resolve();
      } catch (e) {
        reject();
      }
    });
  }
}

module.exports = FileWriter;
