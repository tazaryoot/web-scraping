import Main from './main';
import config from './scraper.config';

const yargs = require('yargs');
const readline = require('readline');

if (!config.scrapingModulePath) {
  throw new Error('scrapingModulePath not set');
}
if (!config.urlCore) {
  throw new Error('urlCore not set');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

yargs
  .option('selector', { alias: 's', describe: 'css selector string' })
  .option('exporting', { alias: 'e', describe: 'export to csv' })
  .option('regex', { alias: 'r', describe: 'regular expression string' });


const main = new Main(yargs.argv, rl);

if (!yargs.argv.selector && yargs.argv.exporting) {
  main.exportToCSV();

  rl.close();
}

main.startSearch().then();
