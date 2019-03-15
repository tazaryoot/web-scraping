const needle = require('needle');
const tress = require('tress');
const perf = require('execution-time')();
const cliProgress = require('cli-progress');
const yargs = require('yargs');
const readline = require('readline');

const FileWriter = require('./lib/fileWriter');
const config = require('../scraper.config');

if (!config.scrapingModulePath) {
  throw new Error('scrapingModulePath not set');
}
if (!config.urlCore) {
  throw new Error('urlCore not set');
}

const scraping = require(config.scrapingModulePath);
const {
  urlCore,
  excludeURL,
  resultPath,
} = config;
const url = config.urlMap || urlCore;
const exportSettings = { ...(config.exportSettings || {}), path: resultPath };

const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
const fileWriter = new FileWriter();

function exportToCSV() {
  console.log('Exporting...');
  fileWriter.initExport2CSV(exportSettings);
  fileWriter.export2Csv();
}

fileWriter.startWriteStream(`log-${fileWriter.getTime(true)}.txt`);

const results = [];

perf.start();

console.info('Starting...');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('SIGINT', () => {
  fileWriter.writeResultsFile(results);
  rl.close();
});

// Option list
yargs
  .option('selector', { alias: 's', describe: 'css selector string' })
  .option('exporting', { alias: 'e', describe: 'export to csv' })
  .option('regex', { alias: 'r', describe: 'regular expression string' });

const { argv } = yargs;

// export
if (!argv.selector && argv.exporting) {
  exportToCSV();

  rl.close();
}

// search
let selectorString = '';
if (argv.selector) {
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

  if (argv.regex) {
    regexp = new RegExp(argv.regex, 'g');
  }

  try {
    const queue = tress((pageURL, callback) => {
      let fullURL = pageURL;

      if (fullURL.indexOf('http') === -1) {
        fullURL = `${urlCore}${pageURL}`;
      }

      needle.get(fullURL, (err, res) => {
        if (err || res.statusCode !== 200) {
          fileWriter.writeLog({
            message: `Status: ${res.statusCode}. Get page ${fullURL} is failed.`,
            logLevel: 'err',
          });
        } else {
          try {
            fileWriter.writeLog({
              message: `Status: ${res.statusCode}. Scrapping page ${fullURL}.`,
              logLevel: 'inf',
            });

            scraping({
              res,
              url: fullURL,
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
                message: `Parse error on page ${fullURL}\r\n Error: ${e}`,
                logLevel: 'err',
              }),
              fileWriter.writeResultsFile(results, resultPath),
            ])
              .then(() => {
                console.error(`Parse error on page ${fullURL}`);
                setTimeout(() => { process.exit(-1); }, 1000);
              })
              .catch();
          }
        }

        callback();
      });
    });

    queue.drain = () => {
      const performance = perf.stop();

      Promise.all([
        fileWriter.writeLog({
          message: `Executing time: ${performance.verboseWords}`,
          logLevel: 'inf',
        }),
        fileWriter.writeResultsFile(results, resultPath),
      ])
        .then(() => {
          if (argv.exporting) {
            console.log('Exporting...');
            fileWriter.initExport2CSV(exportSettings);
            fileWriter.export2Csv();
          }
          progressBar.stop();
          console.warn(`Executing time: ${performance.verboseWords}`);

          rl.close();
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
