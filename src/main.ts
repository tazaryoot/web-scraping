import { NeedleResponse } from 'needle';
import { Interface as Readline } from 'readline';
import { TressJobData, TressStatic, TressWorkerDoneCallback } from 'tress';
import { CliArguments } from './interfaces/cli-arguments';
import { CliProgress } from './interfaces/cli-progress';

import { Config } from './interfaces/config';
import { ExecutionTime } from './interfaces/execution-time';
import { NeedleConstructor } from './interfaces/needle-constructor';
import { ResultItem } from './interfaces/result-item';
import { TessConstructor } from './interfaces/tess-constructor';
import { FileWriter } from './lib/fileWriter';
import { scraping } from './lib/scrap_modules/testAllSite';
import { config } from './scraper.config';

/* eslint-disable */
const needle: NeedleConstructor = require('needle');
const tress: TessConstructor = require('tress');
const perf: ExecutionTime = require('execution-time')();
const cliProgress: CliProgress = require('cli-progress');
/* eslint-enable */


export interface TressHandlerParams extends TressJobData {
  url: string;
}


export default class Main {
  private fileWriter: FileWriter;
  private results: ResultItem[] = [];
  private argv: CliArguments;
  private readonly queue: TressStatic;
  private selectorString: string;
  private regexp: RegExp | undefined;
  private rl: Readline;
  private resultPath: string;
  private config: Config;
  // private readonly progressBar: CliProgressBar;
  private readonly url: string;

  constructor(argv: unknown, rl: Readline) {
    // const { Bar: bar } = cliProgress;
    // this.progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic) as any;
    this.fileWriter = new FileWriter();
    this.config = config as Config;
    this.url = this.config.urlMap || this.config.urlCore;
    this.argv = argv as CliArguments;
    this.rl = rl;
    this.selectorString = '';

    this.resultPath = this.config.resultPath || './';

    this.fileWriter.startWriteStream(`log-${FileWriter.getTime(true)}.txt`);

    perf.start();
    this.queue = tress(this.tressHandler.bind(this));

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
      console.error(`Error ${e as string}`);

      await this.fileWriter.writeLog({
        message: `Global error\r\n Error: ${e as string}`,
        logLevel: 'err',
      });

      await this.safetyWriteResult();

      setTimeout(() => { process.exit(-1); }, 1000);
    }
  }


  // Метод обрабатывает очередь запросов
  private queueHandler(): void {
    this.queue.drain = this.drain.bind(this);

    this.queue.push({ url: this.url });
  }


  // Метод запрашивает страницы из очереди
  private tressHandler (page: TressJobData, callback: TressWorkerDoneCallback): void {
    void (async () => {
      try {
        if (!page?.url) {
          throw new Error(`Parameter page is incorrect.`);
        }

        const { url } = page as TressHandlerParams;
        let fullURL = url;

        if (fullURL.indexOf('http') === -1) {
          fullURL = `${this.config.urlCore}${url}`;
        }

        const response: NeedleResponse = await needle('get', fullURL);
        const { statusCode = 0 } = response;

        if (statusCode >= 300 && statusCode < 400) {
          const location = response.headers.location as string;

          this.queue.push({ url: location});

        } else if (statusCode !== 200) {
          throw new Error(`Status: ${statusCode}. Get page ${fullURL} is failed.`);
        } else {
          this.responseHandler(response, fullURL)
        }
      }
      catch (e) {
        await this.fileWriter.writeLog({
          message: e as string,
          logLevel: 'err',
        });
      }
      finally {
        callback(null);
      }
    })()
  }


  // Метод завершает обработку очереди
  private drain(): void {
    void (async () => {
      const performance = perf.stop();

      await this.fileWriter.writeLog({
        message: `Executing time: ${performance.verboseWords}`,
        logLevel: 'inf',
      });
      await this.safetyWriteResult();

      if (this.argv.exporting) {
        console.log('Exporting...');
      }

      this.fileWriter.endWriteStream();
      // this.progressBar.stop();
      console.warn(`Executing time: ${performance.verboseWords}`);
      this.rl.close();
    })();
  }


  // Метод обрабатывает полученные данные
  private responseHandler(response: NeedleResponse, url: string): void {
    const { statusCode = 0 } = response;

    void this.fileWriter.writeLog({
      message: `Status: ${statusCode}. Scrapping page ${url}.`,
      logLevel: 'inf',
    });

    try {
      scraping({
        results: this.results,
        progressBar: null,
        excludeURL: this.config.excludeURL,
        queue: this.queue,
        selectorString: this.selectorString,
        regexp: this.regexp,
        url,
        response,
      });
    } catch (e) {
      throw new Error(`Parse error on page ${url}\\r\\n Error: ${e as string}`)
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

  private async safetyWriteResult(): Promise<void> {
    try {
      await FileWriter.writeResultsFile(this.results, this.config.resultPath);
    } catch (e) {
      await this.fileWriter.writeLog({
        message: `Cannot write result\r\n Error: ${e as string}`,
        logLevel: 'err',
      });
    }
  }

}
