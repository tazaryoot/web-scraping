/*jshint esversion: 6 */

const config = require('./config');

if (!config.scrappingModulePath) {
  throw new Error('scrappingModulePath not set');
}
if (!config.urlCore) {
  throw new Error('urlCore not set');
}

const needle = require('needle');
const tress = require('tress');
const perf = require('execution-time')();
const _cliProgress = require('cli-progress');
const writeResults = require('./lib/write');
const argv = require('yargs').argv;
const scrapping = require(config.scrappingModulePath);
const readline = require('readline');
const urlCore = config.urlCore;
const url = config.urlMap || config.urlCore;

const progressBar =  new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

let results = {};

perf.start();

/* needle.defaults({
  open_timeout: 50
}); */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('SIGINT', () => {
  writeResults(results);
  rl.close();
});

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
        console.error(`Get page ${url} is failed`);
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
        console.error(`Parse error on page ${url}`);
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
    rl.close();
  };

  queue.push(url);
} catch (e) {
  console.error('Common error');
  writeResults(results);
  throw e;
}
