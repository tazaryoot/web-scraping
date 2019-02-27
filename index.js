#!/usr/bin/env node
const needle = require('needle');
const tress = require('tress');
const perf = require('execution-time')();
const cliProgress = require('cli-progress');
const bs = require('browser-sync').create();
const { argv } = require('yargs');
const readline = require('readline');

const FileWriter = require('./lib/fileWriter');
const config = require('./scraper.config');

if (!config.scrapingModulePath) {
  throw new Error('scrapingModulePath not set');
}
if (!config.urlCore) {
  throw new Error('urlCore not set');
}

const scraping = require(config.scrapingModulePath);
const { urlCore } = config;
const url = config.urlMap || urlCore;
const { excludeURL } = config;
const resultPath = config.resultPath || './build/client/app/assets/';
const exportSettings = { ...(config.exportSettings || {}), path: resultPath };

const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
const fileWriter = new FileWriter();

const bsConfig = {
  server: './build/client/app',
  port: 4044,
  files: ['./build/client/app/css/style.css', './build/client/app/js/*.js', './client/app/*.html'],
};
function exportToCSV() {
  console.log('Exporting...');
  fileWriter.initExport2CSV(exportSettings);
  fileWriter.export2Csv();
}

fileWriter.startWriteStream(`log-${fileWriter.getTime(true)}.txt`);

const results = [];

perf.start();

/* needle.defaults({
  open_timeout: 50
}); */

console.info('Starting...');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('SIGINT', () => {
  fileWriter.writeResultsFile(results);
  rl.close();
});

let selectorString = '';
if (!argv.selector) {

  if (argv.server) {

    console.info('Starting server...');

    bs.init(bsConfig);

    rl.close();
  } else if (argv.export) {
    exportToCSV();

    rl.close();
  } else {
    fileWriter.writeLog({
      message: 'selector is empty!',
      logLevel: 'err',
    })
      .then(() => {
        console.error('selector is empty!');
        setTimeout(() => { process.exit(-1); }, 1000);
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

  let regexp = null;
  if (argv.regexp) {
    regexp = new RegExp(argv.regexp);
  }

  try {
    const queue = tress((url, callback) => {
      if (url.indexOf('http') === -1) {
        url = `${urlCore}${url}`;
      }

      needle.get(url, (err, res) => {
        if (err || res.statusCode !== 200) {
          fileWriter.writeLog({
            message: `Status: ${res.statusCode}. Get page ${url} is failed.`,
            logLevel: 'err',
          });
        } else {
          try {
            fileWriter.writeLog({
              message: `Status: ${res.statusCode}. Scrapping page ${url}.`,
              logLevel: 'inf',
            });

            scraping({
              res,
              url,
              queue,
              results,
              selectorString,
              progressBar,
              excludeURL,
              regexp,
            });
          } catch (e) {
            // если произойдет ошибк
            Promise.all([
              fileWriter.writeLog({
                message: `Parse error on page ${url}\r\n Error: ${e}`,
                logLevel: 'err',
              }),
              fileWriter.writeResultsFile(results, resultPath),
            ])
              .then(() => {
                console.error(`Parse error on page ${url}`);
                setTimeout(() => { process.exit(-1); }, 1000);
              })
              .catch();
          }
        }

        callback();
      });
    });

    queue.drain = () => {
      const perfomance = perf.stop();

      Promise.all([
        fileWriter.writeLog({
          message: `Executing time: ${perfomance.verboseWords}`,
          logLevel: 'inf',
        }),
        fileWriter.writeResultsFile(results, resultPath),
      ])
        .then(() => {
          if (argv.export) {
            console.log('Exporting...');
            fileWriter.initExport2CSV(exportSettings);
            fileWriter.export2Csv();
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
      fileWriter.writeLog({
        message: `Common error\r\n Error: ${e}`,
        logLevel: 'err',
      }),
      fileWriter.writeResultsFile(results, resultPath),
    ])
      .then(() => {
        console.error('Common error');
        setTimeout(() => { process.exit(-1); }, 1000);
      })
      .catch();
  }
}

fileWriter.writeLog({
  message: `Start scrapping with selectors ${selectorString}`,
  logLevel: 'inf',
});
