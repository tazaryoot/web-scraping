import 'reflect-metadata';
import { inject, injectable, unmanaged } from 'inversify';
import { Interface as Readline } from 'readline';

import { CliArguments } from './interfaces/cli-arguments';
import { Config } from './interfaces/config';
import { ExecutionTime } from './interfaces/execution-time';
import { ExtendedResponse } from './interfaces/extended-response';
import { FileWrite } from './interfaces/file-write';
import { FunctionType } from './interfaces/function-type';
import { HttpClient } from './interfaces/http-client';
import { ProgressBar } from './interfaces/progress-bar';
import { JobData, JobDataExtended, QueueJob, QueueJobStatic } from './interfaces/queue-job';
import { ResultItem } from './interfaces/result-item';
import { Scraper } from './interfaces/scraper';
import { TYPES } from './interfaces/types';

import { config } from './scraper.config';


@injectable()
export default class Main {
  private results: ResultItem[] = [];
  private selectorString: string;
  private regexp: RegExp | undefined;
  private readonly resultPath: string;
  private readonly url: string;
  private readonly queue: QueueJobStatic;
  private readonly config: Config;


  constructor(
    @inject(TYPES.FileWrite) private fileWriterService: FileWrite,
    @inject(TYPES.Scrapper) private scrapperService: Scraper,
    @inject(TYPES.QueueJob) private queueJobService: QueueJob,
    @inject(TYPES.HttpClient) private httpClientService: HttpClient,
    @inject(TYPES.ExecutionTime) private perfService: ExecutionTime,
    @inject(TYPES.ProgressBar) private cliProgressService: ProgressBar,
    @unmanaged() private argv: CliArguments,
    @unmanaged() private rl: Readline,
  ) {
    this.config = config as Config;
    this.url = this.config.urlMap || `${this.config.urlCore}${this.config.urlScrapContext || ''}`;
    this.selectorString = '';
    this.resultPath = this.config.resultPath || '../build/';
    this.queueJobService.createQueue(this.tressHandler.bind(this));

    this.queue = this.queueJobService.getQueue();
  }


  init(argv: unknown, rl: Readline): void {
    this.argv = argv as CliArguments;
    this.rl = rl;

    this.fileWriterService.startWriteStream(`log-${this.fileWriterService.getTime(true)}.txt`);
    this.createSelectorString();
    this.createRegEx();
    this.perfService.start();
  }


  // Метод стартует поиск
  async startSearch(): Promise<void> {
    console.info('Starting...');

    this.cliProgressService.start(100);

    await this.fileWriterService.writeLog({
      message: `Start scrapping with selectors ${this.selectorString}`,
      logLevel: 'inf',
    });

    try {
      this.queueHandler();
    } catch (e) {
      console.error(`Error ${e as string}`);

      await this.fileWriterService.writeLog({
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
      this.cliProgressService.update();

      try {
        if (!page?.url) {
          throw new Error(`Parameter page is incorrect.`);
        }

        const { url } = page as JobDataExtended;
        let fullURL = url;

        if (!fullURL.includes('http')) {
          fullURL = `${this.config.urlCore}${url}`;
        }

        const response: ExtendedResponse = await this.httpClientService.get(fullURL);
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
        await this.fileWriterService.writeLog({
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
      const performance = this.perfService.stop();

      await this.fileWriterService.writeLog({
        message: `Executing time: ${performance.verboseWords}`,
        logLevel: 'inf',
      });
      await this.safetyWriteResult();

      if (this.argv.exporting) {
        console.log('Exporting...');
      }

      this.fileWriterService.endWriteStream();

      this.cliProgressService.setTotal(0);


      console.warn(`Executing time: ${performance.verboseWords}`);

      this.rl.close();
    })();
  }


  // Метод обрабатывает полученные данные
  private responseHandler(response: ExtendedResponse, url: string): void {
    const { statusCode = 0 } = response;

    void this.fileWriterService.writeLog({
      message: `Status: ${statusCode as number}. Scrapping page ${url}.`,
      logLevel: 'inf',
    });

    this.queueJobService.queuedLinkList.push(url);

    try {
      this.scrapperService.start({
        results: this.results,
        excludeURL: this.config.excludeURL,
        selectorString: this.selectorString,
        regexp: this.regexp,
        body: response.body,
        urlCore: this.config.urlCore,
        urlScrapContext: this.config.urlScrapContext || '/',
        url,
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
      await this.fileWriterService.writeResultsFile(this.results, this.resultPath);
    } catch (e) {
      await this.fileWriterService.writeLog({
        message: `Cannot write result\r\n Error: ${e as string}`,
        logLevel: 'err',
      });
    }
  }
}
