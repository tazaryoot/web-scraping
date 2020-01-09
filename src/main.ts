import { Interface as Readline } from 'readline';
import { CliArguments } from './interfaces/cli-arguments';

import { ExportToCsvParams } from './interfaces/export-to-csv-params';
import { ResultItem } from './interfaces/result-item';
import { FileWriter } from './lib/fileWriter';
import { scraping } from './lib/scrap_modules/testAllSite';
import config from './scraper.config';

const needle = require('needle');
const tress = require('tress');
const perf = require('execution-time')();
const cliProgress = require('cli-progress');


export default class Main {
  private fileWriter: FileWriter;
  private results: ResultItem[] = [];
  private argv: CliArguments;
  private queue: any;
  private readonly progressBar: any;
  private readonly url: string;
  private readonly exportSettings: ExportToCsvParams;
  private selectorString: string;
  private regexp: RegExp | undefined;
  private rl: Readline;

  constructor(argv: CliArguments, rl: Readline) {
    this.progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
    this.fileWriter = new FileWriter();
    this.url = config.urlMap || config.urlCore;
    this.argv = argv;
    this.rl = rl;
    this.selectorString = '';
    this.exportSettings = {
      fields: ['page', 'title', { label: 'tag', value: 'tags.name' }, { label: 'text', value: 'tags.list.text' }],
      unwind: ['tags', 'tags.list'],
      delimiter: ';',
    };

    this.fileWriter.startWriteStream(`log-${FileWriter.getTime(true)}.txt`);

    perf.start();
    this.tressHandler = this.tressHandler.bind(this);
    this.drain = this.drain.bind(this);

    this.createSelectorString();
    this.createRegEx();
  }


  // Метод стартует поиск
  public async startSearch(): Promise<void> {
    console.info('Starting...');

    await this.fileWriter.writeLog({
      message: `Start scrapping with selectors ${this.selectorString}`,
      logLevel: 'inf',
    });

    try {
      this.queueHandler();
    } catch (e) {
      console.error('Error');

      await this.fileWriter.writeLog({
        message: `Common error\r\n Error: ${e}`,
        logLevel: 'err',
      });

      await FileWriter.writeResultsFile(this.results, config.resultPath);

      setTimeout(() => { process.exit(-1); }, 1000);
    }
  }


  // Метод экспортирует данные в CSV
  public exportToCSV(): void {
    console.log('Exporting...');
    this.fileWriter.initExport2CSV(this.exportSettings);
    this.fileWriter.export2Csv();
  }


  // Метод обрабатывает очередь запросов
  private queueHandler(): void {
    this.queue = tress(this.tressHandler);

    this.queue.drain = this.drain;

    this.queue.push(this.url);
  }


  // Метод запрашивает страницы из очереди
  private async tressHandler(pageURL: string, callback: any) {
    let fullURL = pageURL;

    if (fullURL.indexOf('http') === -1) {
      fullURL = `${config.urlCore}${pageURL}`;
    }

    try {
      const response = await needle('get', fullURL);
      const { statusCode } = response;

      if (statusCode !== 200) {
        throw new Error(`Status: ${statusCode}. Get page ${fullURL} is failed.`);
      }

      this.responseHandler(response, fullURL)
    }
    catch (e) {
      await this.fileWriter.writeLog({
        message: e,
        logLevel: 'err',
      });
      await FileWriter.writeResultsFile(this.results, config.resultPath);
    }
    finally {
      callback();
    }
  }


  // Метод завершает обработку очереди
  private async drain(): Promise<void> {
    const performance = perf.stop();

    await this.fileWriter.writeLog({
      message: `Executing time: ${performance.verboseWords}`,
      logLevel: 'inf',
    });
    await FileWriter.writeResultsFile(this.results, config.resultPath);

    if (this.argv.exporting) {
      console.log('Exporting...');
      this.fileWriter.initExport2CSV(this.exportSettings);
      this.fileWriter.export2Csv();
    }

    this.fileWriter.endWriteStream();
    this.progressBar.stop();
    console.warn(`Executing time: ${performance.verboseWords}`);
    this.rl.close();
  }


  // Метод обрадатывет полученные данные
  private responseHandler(response: any, url: string): void {
    const { statusCode } = response;

    if (statusCode !== 200) {
      throw new Error(`Status: ${statusCode}. Get page ${url} is failed.`);
    }

    this.fileWriter.writeLog({
      message: `Status: ${statusCode}. Scrapping page ${url}.`,
      logLevel: 'inf',
    }).then();

    try {
      scraping({
        results: this.results,
        progressBar: this.progressBar,
        excludeURL: config.excludeURL,
        queue: this.queue,
        selectorString: this.selectorString,
        regexp: this.regexp,
        url,
        response,
      });
    } catch (e) {
      throw new Error(`Parse error on page ${url}\\r\\n Error: ${e}`)
    }
  }


  // Метод формирует строку css селекта
  private createSelectorString(): void {
    if (Array.isArray(this.argv.selector)) {
      this.argv.selector.forEach((selector: string, idx: number) => {
        this.selectorString += selector;

        if (this.argv.selector && idx < this.argv.selector.length - 1) {
          this.selectorString += ',';
        }
      });
    } else {
      this.selectorString += this.argv.selector;
    }
  }


  // Метод формирует регулярку
  private createRegEx(): void {
    if (this.argv.regex) {
      this.regexp = new RegExp(this.argv.regex, 'g');
    }
  }

}
