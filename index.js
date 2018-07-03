/*jshint esversion: 6 */

const needle = require('needle');
const tress = require('tress');
const perf = require('execution-time')();
const _cliProgress = require('cli-progress');
const writeResults = require('./lib/write');
const argv = require('yargs').argv;
const scrapping = require('./lib/scrap_modules/gazprom');

const urlCore = 'http://t02.gazprom.dev.design.ru';
const url = `${urlCore}/map/`;

const progressBar =  new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

let results = {};

perf.start();

/* needle.defaults({
  open_timeout: 50
}); */

let selectorString = '';
if (argv.selector) {

  if (Array.isArray(argv.selector)) {
    argv.selector.forEach((selector, idx) =>{
      selectorString += selector;

      if (idx < argv.selector.length - 1) {
        selectorString += ',';
      }
    });
  } else {
    selectorString += argv.selector;
  }
} else {
  throw new Error('selector is empty!');
}

try {
  let queue = tress((url, callback) => {

    if (url.indexOf('http') === -1) {
      url = `${urlCore}${url}`;
    }

    needle.get(url, (err, res) => {

      if (err) {
        console.error('Get page error');
        writeResults(results);
        return;
      }

      try {

        scrapping({
          res: res,
          url: url,
          queue: queue,
          results: results,
          selectorString: selectorString,
          progressBar: progressBar
        });

        callback();
      } catch (e) {
        console.error('Error in parse');
        writeResults(results);
        throw e;
      }
    });

  });

  queue.drain = function() {
    writeResults(results);

    progressBar.stop();
    let perfomance = perf.stop();
    console.warn('Executing time:', perfomance.verboseWords);
  };

  queue.push(url);
} catch (e) {
  console.error('Common error');
  writeResults(results);
  throw e;
}
