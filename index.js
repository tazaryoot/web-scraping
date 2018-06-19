/*jshint esversion: 6 */

const needle = require('needle');
const tress = require('tress');

const url = 'http://t02.gazprom.dev.design.ru/';

let results = [];

let q = tress((url, callback) => {

  needle.get(url, (err, res) => {

    if (err) {
      throw err;
    }

    callback();
  });

});

q.drain = function() {
  require('fs').writeFileSync('./result.json', JSON.stringify(results, null, 4));
};

q.push(url);
