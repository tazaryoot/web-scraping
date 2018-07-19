/*jshint esversion: 6 */

const fs = require('fs');
const groupingResult = require('./groupingResult');

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

  getTime(short) {
    const date = new Date();
    let time = `${date.getFullYear()}-${this.__pad(date.getMonth() + 1)}-${this.__pad(date.getDate())}`;

    if (!short){
      time += `T${this.__pad(date.getHours())}:${this.__pad(date.getMinutes())}:${this.__pad(date.getSeconds())}`;
    }
    return time;
  }

  results(resluts, path = './') {
    resluts = groupingResult(resluts);
    fs.writeFileSync(path + 'result.json', JSON.stringify(resluts, null, 4, 'utf-8'));
  }

  log(logObj) {
    let {message, logLevel} = logObj;
    this.writeStream.write(`[${this.getTime()}][${logLevel}] ${message}\r\n`);
  }

  message(message) {
    this.writeStream.write(`${message}\r\n`);
  }

}

module.exports = Write;
