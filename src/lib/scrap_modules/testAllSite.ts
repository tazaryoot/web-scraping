const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;

import { ResultTagItem } from '../../interfaces/result-tag-item';
import { ScrapingParams } from '../../interfaces/scraping-params';
import { FileWriter } from '../fileWriter';

const entities = new Entities();
const fileWriter = new FileWriter();

const queuedLinkList: any = [];
let count = 0;
let limit = 100;
let progressValue = 0;

fileWriter.startWriteStream('map.txt');
fileWriter.writeMessageInStream('{').then(() => {});

/**
 * Функция для парсинга для сайта t02.gazprom.dev.design.ru
 * @param {Object} params
 * @return void
 */
export function scraping(params: ScrapingParams) {
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
        fileWriter.writeMessageInStream(`{page: "${link}"},`);
        queue.push(/^\//.test(link) ? link : `/${link}`);
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
      path: url.replace(/(http:\/\/t02.gazprom.dev.design.ru\/?)|(\/$)/g, '').split('/'),
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

    tags[idx].list.push({
      text: $element.text(),
      html: entities.decode($('<div></div>').html($element.clone()).html()),
    });
  });

  progressValue += 1;
  progressBar.update(progressValue);
}
