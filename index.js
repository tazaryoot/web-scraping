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
const resultPath = config.resultPath || './build/client/app/assets/';
/* jshint ignore:start */
const exportSettings = {...(config.exportSettings || {}), path: resultPath};
/* jshint ignore:end */

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
if (!argv.selector) {
  if (argv.server) {
    console.info('Starting server...');

    bs.init(bsConfig);

    rl.close();

  } else if (argv.export) {
    console.log('Exporting...');

    write.initExport2CSV(exportSettings);
    write.export2Csv();

    let perfomance = perf.stop();

    write.log({
      message: `Executing time: ${perfomance.verboseWords}`,
      logLevel: 'inf'
    })
      .then(() => {
        console.warn(`Executing time: ${perfomance.verboseWords}`);
        rl.close();
      });


  } else {
    write.log({
      message: 'selector is empty!',
      logLevel: 'err'
    })
      .then(() => {
        console.error('selector is empty!');
        setTimeout(() => {process.exit(-1);}, 1000);
      });

  }
} else {
  if (Array.isArray(argv.selector)) {
    argv.selector.forEach((selector, idx) => {
      selectorString += selector;

      if (idx < argv.selector.length - 1) {
        selectorString += ',';
      }
    });
  } else {
    selectorString += argv.selector;
  }

  try {
    let queue = tress((url, callback) => {

      if (url.indexOf('http') === -1) {
        url = `${urlCore}${url}`;
      }

      needle.get(url, (err, res) => {

        if (err || res.statusCode !== 200 ) {
          write.log({
            message: `Status: ${res.statusCode}. Get page ${url} is failed.`,
            logLevel: 'err'
          });
        } else {
          try {

            write.log({
              message: `Status: ${res.statusCode}. Scrapping page ${url}.`,
              logLevel: 'inf'
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

          } catch (e) {
            Promise.all([
              write.log({
                message: `Parse error on page ${url}\r\n Error: ${e}`,
                logLevel: 'err'
              }),
              write.results(results, resultPath)
            ])
              .then(() => {
                console.error(`Parse error on page ${url}`);
                setTimeout(() => {process.exit(-1);}, 1000);
              })
              .catch();
          }
        }

        callback();
      });

    });

    queue.drain = function() {

      let perfomance = perf.stop();

      Promise.all([
        write.log({
          message: `Executing time: ${perfomance.verboseWords}`,
          logLevel: 'inf'
        }),
        write.results(results, resultPath)
      ])
        .then(() => {
          if (argv.export) {
            console.log('Exporting...');
            write.initExport2CSV(exportSettings);
            write.export2Csv();
          }
          progressBar.stop();
          console.warn(`Executing time: ${perfomance.verboseWords}`);

          rl.close();

          if (argv.server) {
            console.info('Starting server...');

            bs.init(bsConfig);
          }

        })
        .catch();
    };

    queue.push(url);
  } catch (e) {
    Promise.all([
      write.log({
        message: `Common error\r\n Error: ${e}`,
        logLevel: 'err'
      }),
      write.results(results, resultPath)
    ])
      .then(() => {
        console.error('Common error');
        setTimeout(() => {process.exit(-1);}, 1000);
      })
      .catch();
  }
}

write.log({
  message: `Start scrapping with selectors ${selectorString}`,
  logLevel: 'inf'
});
