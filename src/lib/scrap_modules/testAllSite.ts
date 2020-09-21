const cheerio = require('cheerio');

import { ResultTagItem } from '../../interfaces/result-tag-item';
import { ScrapingParams } from '../../interfaces/scraping-params';
import { FileWriter } from '../fileWriter';

const fileWriter = new FileWriter();

const queuedLinkList: string[] = [];
let count = 0;
let limit: number = 100;
let progressValue = 0;

fileWriter.startWriteStream('map.txt');
fileWriter.writeMessageInStream('{').then(() => {});

/**
 * Функция для парсинга для сайта t02.gazprom.dev.design.ru
 * @param {Object} params
 * @return void
 */
export function scraping(params: ScrapingParams): void {
  const {
    response,
    queue,
    results,
    selectorString,
    url,
    excludeURL,
    progressBar,
    regexp,
  } = params;

  if (!progressValue) {
    progressBar.start(progressValue + 1, progressValue);
  }

  const $ = cheerio.load(response.body);
  const area = $('body');

  if (!limit || count < limit) {
    let aList = area.find('a');

    if (excludeURL) {
      aList = aList.filter(function () {
        // @ts-ignore
        return !!$(this).attr('href') && !excludeURL.test($(this).attr('href'));
      });
    }

    aList.each(function () {
      // @ts-ignore
      const link = $(this).attr('href');


      if (queuedLinkList.indexOf(link) === -1 && (!limit || count < limit)) {
        count += 1;

        queuedLinkList.push(link);
        fileWriter.writeMessageInStream(`{page: "${link}"},`).then();
        const jobData = { url: /^\//.test(link) ? link : `/${link}`}
        queue.push(jobData);
        progressBar.setTotal(queuedLinkList.length);
      }
    });
  }

  const itemList = $(selectorString).filter(function () {
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

  progressValue += 1;
  progressBar.update(progressValue);
}
