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
const bs = require('browser-sync').create();
const Write = require('./lib/write');
const argv = require('yargs').argv;
const readline = require('readline');
const scrapping = require(config.scrappingModulePath);

const urlCore = config.urlCore;
const url = config.urlMap || urlCore;
const excludeURL = config.excludeURL;

const progressBar =  new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
const write = new Write();

const bsConfig = {
  server: './build/client/app',
  port: 4044,
  files: ['./build/client/app/css/style.css', './build/client/app/js/*.js', './client/app/*.html']
};

write.startWriteStream(`log-${write.getTime(true)}.txt`);

let results = [];

perf.start();

/* needle.defaults({
  open_timeout: 50
}); */

console.info('Starting...');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('SIGINT', () => {
  write.results(results);
  rl.close();
});

let selectorString = '';
if (argv.server && !argv.selector) {
  console.info('Starting server...');

  bs.init(bsConfig);

  rl.close();
} else if (argv.selector) {

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

  try {
    const resultPath = './build/client/app/assets/';
    let queue = tress((url, callback) => {

      if (url.indexOf('http') === -1) {
        url = `${urlCore}${url}`;
      }

      needle.get(url, (err, res) => {

        if (err) {
          write.log({
            message: `Get page ${url} is failed\r\n Error: ${err}`,
            logLevel: 'error'
          });
          console.error(`Get page ${url} is failed`);
          write.results(results, resultPath);
          return;
        }

        try {

          write.log({
            message: `Scrapping page ${url}`,
            logLevel: 'info'
          });
          scrapping({
            res: res,
            url: url,
            queue: queue,
            results: results,
            selectorString: selectorString,
            progressBar: progressBar,
            excludeURL: excludeURL
          });

          callback();
        } catch (e) {
          write.log({
            message: `Parse error on page ${url}\r\n Error: ${e}`,
            logLevel: 'error'
          });
          console.error(`Parse error on page ${url}`);
          write.results(results, resultPath);
          throw e;
        }
      });

    });

    queue.drain = function() {
      write.results(results, resultPath);

      progressBar.stop();
      let perfomance = perf.stop();
      write.log({
        message: `Executing time: ${perfomance.verboseWords}`,
        logLevel: 'info'
      });
      console.warn(`Executing time: ${perfomance.verboseWords}`);

      rl.close();

      if (argv.server) {
        console.info('Starting server...');

        bs.init(bsConfig);
      }

    };

    queue.push(url);
  } catch (e) {
    write.log({
      message: `Common error\r\n Error: ${e}`,
      logLevel: 'error'
    });
    console.error('Common error');
    write.results(results, resultPath);
    throw e;
  }

} else {
  write.log({
    message: 'selector is empty!',
    logLevel: 'error'
  });
  throw new Error('selector is empty!');
}

write.log({
  message: `Start scrapping with selectors ${selectorString}`,
  logLevel: 'info'
});
