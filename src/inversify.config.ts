import { Container } from 'inversify';
import { CheckUrl } from './interfaces/check-url';
import { ProgressBar } from './interfaces/progress-bar';
import { CheckUrlService } from './services/check-url.service';

import { ExecutionTimerService } from './services/execution-timer.service';
import { FileWriterService } from './services/file-writer.service';
import { HttpClientNeedleService } from './services/http-client-needle.service';
import { ProgressBarService } from './services/progress-bar.service';
import { Queue } from './services/queue.service';
import { SiteScrapperService } from './services/site-scrapper.service';

import { ExecutionTime } from './interfaces/execution-time';
import { FileWrite } from './interfaces/file-write';
import { HttpClient } from './interfaces/http-client';
import { QueueJob } from './interfaces/queue-job';
import { Scraper } from './interfaces/scraper';
import { TYPES } from './interfaces/types';

import Main from './main';

const appContainer: Container = new Container();

appContainer.bind<FileWrite>(TYPES.FileWrite).to(FileWriterService);
appContainer.bind<Scraper>(TYPES.Scrapper).to(SiteScrapperService);
appContainer.bind<HttpClient>(TYPES.HttpClient).to(HttpClientNeedleService);
appContainer.bind<ExecutionTime>(TYPES.ExecutionTime).to(ExecutionTimerService);
appContainer.bind<QueueJob>(TYPES.QueueJob).to(Queue).inSingletonScope();
appContainer.bind<ProgressBar>(TYPES.ProgressBar).to(ProgressBarService).inSingletonScope();
appContainer.bind<CheckUrl>(TYPES.CheckUrl).to(CheckUrlService).inSingletonScope();

appContainer.bind<Main>(TYPES.Main).to(Main);

export { appContainer };
