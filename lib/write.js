/*jshint esversion: 6 */

const fs = require('fs');

class Write {
  constructor() {
  }
  startWriteStream(fileName) {
    this.writeStream = fs.createWriteStream(fileName);
  }
  endWriteStream() {
    this.writeStream.end();
  }
  __pad(n){
    return n < 10 ? '0' + n : n;
  }
  __getTime() {
    const date = new Date();
    return `${date.getFullYear()}-${this.__pad(date.getMonth() + 1)}-${this.__pad(date.getDate())}T${this.__pad(date.getHours())}:${this.__pad(date.getMinutes())}:${this.__pad(date.getSeconds())}`;
  }
  results (resluts) {
    fs.writeFileSync('./result.json', JSON.stringify(resluts, null, 4, 'utf-8'));
  }
  log (logObj) {
    let {message, logLevel} = logObj;
    this.writeStream.write(`[${this.__getTime()}][${logLevel}] ${message}\r\n`);
  }

}

module.exports = Write;
