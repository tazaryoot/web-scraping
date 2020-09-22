import * as readline from "readline";
import yargs from 'yargs'

import Main from './main';
import { config } from './scraper.config';

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

void main.startSearch();
