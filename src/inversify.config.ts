import { Container } from 'inversify';

import { ExecutionTimer } from './entities/execution-timer';
import { FileWriter } from './entities/file-writer';
import { HttpClientNeedle } from './entities/http-client-needle';
import { Queue } from './entities/queue';
import { SiteScrapper } from './entities/site-scrapper';

import { ExecutionTime } from './interfaces/execution-time';
import { FileWrite } from './interfaces/file-write';
import { HttpClient } from './interfaces/http-client';
import { QueueJob } from './interfaces/queue-job';
import { Scraper } from './interfaces/scraper';
import { TYPES } from './interfaces/types';

import Main from './main';

const appContainer: Container = new Container();

appContainer.bind<FileWrite>(TYPES.FileWrite).to(FileWriter);
appContainer.bind<Scraper>(TYPES.Scrapper).to(SiteScrapper);
appContainer.bind<QueueJob>(TYPES.QueueJob).to(Queue);
appContainer.bind<HttpClient>(TYPES.HttpClient).to(HttpClientNeedle);
appContainer.bind<ExecutionTime>(TYPES.ExecutionTime).to(ExecutionTimer);

appContainer.bind<Main>(TYPES.Main).to(Main);

export { appContainer };
