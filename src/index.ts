import { createInterface } from 'readline';
import yargs from 'yargs';

import Main from './main';
import { TYPES } from './interfaces/types';
import { appContainer } from './inversify.config';
import { config } from './scraper.config';


if (!config.urlCore) {
  throw new Error('urlCore not set');
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

yargs
  .option('selector', { alias: 's', describe: 'css selector string' })
  .option('exporting', { alias: 'e', describe: 'export to csv' })
  .option('regex', { alias: 'r', describe: 'regular expression string' });


const mainApp = appContainer.get<Main>(TYPES.Main);

mainApp.init(yargs.argv, rl);
void mainApp.startSearch();
