import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { CheckUrl } from '../interfaces/check-url';
import { FileWrite } from '../interfaces/file-write';
import { ProgressBar } from '../interfaces/progress-bar';
import { QueueJob, QueueJobStatic } from '../interfaces/queue-job';
import { ResultTagItem } from '../interfaces/result-tag-item';

import { Scraper } from '../interfaces/scraper';
import { ScrapingParams } from '../interfaces/scraping-params';
import { TYPES } from '../interfaces/types';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio = require('cheerio');


@injectable()
export class SiteScrapperService implements Scraper {
  private count = 0;
  private limit = 100;


  constructor(
    @inject(TYPES.FileWrite) private fileWriter: FileWrite,
    @inject(TYPES.ProgressBar) private cliProgress: ProgressBar,
    @inject(TYPES.QueueJob) private queueJob: QueueJob,
    @inject(TYPES.CheckUrl) private checkUrl: CheckUrl,
  ) {
    this.fileWriter.startWriteStream('map.txt');
  }


  start(params: ScrapingParams): void {
    const {
      body,
      results,
      selectorString,
      url,
      excludeURL,
      regexp,
      urlCore,
      urlScrapContext,
    } = params;

    const $ = cheerio.load(body);
    const area = $('body');
    const that = this;
    const queue: QueueJobStatic = this.queueJob.getQueue();

    if (!this.limit || this.count < this.limit) {
      let aList = area.find('a');

      if (excludeURL) {
        aList = aList.filter(function() {
          // @ts-ignore
          return !!$(this).attr('href') && !excludeURL.test($(this).attr('href'));
        });
      }

      aList = aList.filter(function() {
        // @ts-ignore
        return !!$(this).attr('href') && that.checkUrl.check($(this).attr('href'), urlCore, urlScrapContext);
      })

      aList.each(function() {
        // @ts-ignore
        const link = $(this).attr('href') as string;


        if (that.queueJob.queuedLinkList.indexOf(link) === -1 && (!that.limit || that.count < that.limit)) {
          that.count += 1;

          that.queueJob.queuedLinkList.push(link);

          void that.fileWriter.writeMessageInStream(`{page: "${link}"},`);

          const jobData = { url: /^\//.test(link) ? link : `/${link}`}
          queue.push(jobData);

          that.cliProgress.setTotal(that.queueJob.queuedLinkList.length);
        }
      });
    }

    const itemList = $(selectorString).filter(function() {
      if (!regexp) {
        return true;
      }

      // @ts-ignore
      return regexp.test($(this).text());
    });

    let resultsLength = results.length - 1;

    if (itemList.length) {
      results.push({
        page: url,
        title: $('title').text(),
        tags: [],
      });

      resultsLength += 1;
    }

    itemList.each(function () {
      // @ts-ignore
      const $element = $(this);
      // @ts-ignore
      const tagName = this.tagName.toLowerCase();

      const { tags } = results[resultsLength];
      let idx = tags.findIndex((tag: ResultTagItem) => tag.name === tagName);

      if (!tags.length || idx === -1) {
        tags.push({
          name: tagName,
          list: [],
        });

        idx = tags.length - 1;
      }

      if ($element[0]) {
        const element = $element[0];
        const listItem: Record<string, string> = {};

        if (element.attribs?.classes) {
          listItem.classes = element.attribs.classes;
        }

        if (element.attribs?.id) {
          listItem.id = element.attribs?.id;
        }

        if (Object.keys(listItem).length) {
          tags[idx].list.push(listItem);
        }
      }
    });
  }

}