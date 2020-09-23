import 'reflect-metadata';
import { IncomingMessage } from 'http';
import { inject, injectable, unmanaged } from 'inversify';
import { Interface as Readline } from 'readline';

import { CliArguments } from './interfaces/cli-arguments';
import { CliProgress } from './interfaces/cli-progress';
import { Config } from './interfaces/config';
import { ExecutionTime } from './interfaces/execution-time';
import { FileWrite } from './interfaces/file-write';
import { FunctionType } from './interfaces/function-type';
import { HttpClient } from './interfaces/http-client';
import { JobData, QueueJob, QueueJobStatic } from './interfaces/queue-job';
import { ResultItem } from './interfaces/result-item';
import { Scraper } from './interfaces/scraper';
import { TYPES } from './interfaces/types';

import { config } from './scraper.config';


/* eslint-disable */
const cliProgress: CliProgress = require('cli-progress');
/* eslint-enable */


export interface JobDataExtended extends JobData {
  url: string;
}

@injectable()
export default class Main {
  private results: ResultItem[] = [];
  private selectorString: string;
  private regexp: RegExp | undefined;
  // private readonly progressBar: CliProgressBar;
  private readonly resultPath: string;
  private readonly url: string;
  private readonly queue: QueueJobStatic;
  private readonly config: Config;


  constructor(
    @inject(TYPES.FileWrite) private fileWriter: FileWrite,
    @inject(TYPES.Scrapper) private scrapper: Scraper,
    @inject(TYPES.QueueJob) private queueJob: QueueJob,
    @inject(TYPES.HttpClient) private httpClient: HttpClient,
    @inject(TYPES.ExecutionTime) private perf: ExecutionTime,
    @unmanaged() private argv: CliArguments,
    @unmanaged() private rl: Readline,
  ) {
    // const { Bar: bar } = cliProgress;
    // this.progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic) as any;
    this.config = config as Config;
    this.url = this.config.urlMap || this.config.urlCore;
    this.selectorString = '';
    this.resultPath = this.config.resultPath || '../build/';
    this.queue = this.queueJob.tessQueue(this.tressHandler.bind(this));
  }


  init(argv: unknown, rl: Readline): void {
    this.argv = argv as CliArguments;
    this.rl = rl;

    this.fileWriter.startWriteStream(`log-${this.fileWriter.getTime(true)}.txt`);
    this.createSelectorString();
    this.createRegEx();
    this.perf.start();
  }


  // Метод стартует поиск
  async startSearch(): Promise<void> {
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
  private tressHandler (page: JobData, callback: FunctionType): void {
    void (async () => {
      try {
        if (!page?.url) {
          throw new Error(`Parameter page is incorrect.`);
        }

        const { url } = page as JobDataExtended;
        let fullURL = url;

        if (fullURL.indexOf('http') === -1) {
          fullURL = `${this.config.urlCore}${url}`;
        }

        const response: IncomingMessage = await this.httpClient.get(fullURL);
        const { statusCode = 0 } = response;

        if (statusCode >= 300 && statusCode < 400) {
          const location = response.headers.location as string;

          this.queue.push({ url: location});

        } else if (statusCode !== 200) {
          throw new Error(`Status: ${statusCode as number}. Get page ${fullURL} is failed.`);
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
        callback();
      }
    })()
  }


  // Метод завершает обработку очереди
  private drain(): void {
    void (async () => {
      const performance = this.perf.stop();

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
  private responseHandler(response: IncomingMessage, url: string): void {
    const { statusCode = 0 } = response;

    void this.fileWriter.writeLog({
      message: `Status: ${statusCode as number}. Scrapping page ${url}.`,
      logLevel: 'inf',
    });

    try {
      this.scrapper.start({
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
      await this.fileWriter.writeResultsFile(this.results, this.resultPath);
    } catch (e) {
      await this.fileWriter.writeLog({
        message: `Cannot write result\r\n Error: ${e as string}`,
        logLevel: 'err',
      });
    }
  }
}
