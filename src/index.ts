const needle = require('needle');
const tress = require('tress');
const perf = require('execution-time')();
const cliProgress = require('cli-progress');
const yargs = require('yargs');
const readline = require('readline');

import { FileWriter } from './lib/fileWriter';
import config from './scraper.config';

if (!config.scrapingModulePath) {
  throw new Error('scrapingModulePath not set');
}
if (!config.urlCore) {
  throw new Error('urlCore not set');
}

// eslint-disable-next-line import/no-dynamic-require
import { scraping } from './lib/scrap_modules/testAllSite';
const {
  urlCore,
  excludeURL,
  resultPath,
} = config;
const url = config.urlMap || urlCore;
const exportSettings = {
  fields: ['page', 'title', { label: 'tag', value: 'tags.name' }, { label: 'text', value: 'tags.list.text' }],
  unwind: ['tags', 'tags.list'],
  delimiter: ';',
};

const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
const fileWriter = new FileWriter();

function exportToCSV() {
  console.log('Exporting...');
  fileWriter.initExport2CSV(exportSettings);
  fileWriter.export2Csv();
}

fileWriter.startWriteStream(`log-${FileWriter.getTime(true)}.txt`);

const results: any = [];

perf.start();

console.info('Starting...');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('SIGINT', () => {
  FileWriter.writeResultsFile(results);
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
    argv.selector.forEach((selector: string, idx: number) => {
      selectorString += selector;

      if (idx < argv.selector.length - 1) {
        selectorString += ',';
      }
    });
  } else {
    selectorString += argv.selector;
  }

  let regexp: RegExp | null = null;

  if (argv.regex) {
    regexp = new RegExp(argv.regex, 'g');
  }

  try {
    const queue = tress((pageURL: string, callback: any) => {
      let fullURL = pageURL;

      if (fullURL.indexOf('http') === -1) {
        fullURL = `${urlCore}${pageURL}`;
      }

      needle.get(fullURL, (err: any, res: any) => {
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
                message: `Parse error2 on page ${fullURL}\r\n Error: ${e}`,
                logLevel: 'err',
              }),
              FileWriter.writeResultsFile(results, resultPath),
            ])
              .then(() => {
                console.error(`Parse error1 on page ${fullURL}`);
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
        FileWriter.writeResultsFile(results, resultPath),
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
      FileWriter.writeResultsFile(results, resultPath),
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
