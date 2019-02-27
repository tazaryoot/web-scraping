const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;
const FileWriter = require('../fileWriter');

const entities = new Entities();
const fileWriter = new FileWriter();

const queuedLinkList = [];
let count = 0;
let limit;
let progressValue = 0;

fileWriter.startWriteStream('map.txt', { flags: 'a' });
fileWriter.writeMessageInStream('{');

/**
 * Функция для парсинга для сайта t02.gazprom.dev.design.ru
 * @param {Object} params
 * @return void
 */
function scraping(params) {
  const {
    res,
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

  const $ = cheerio.load(res.body);
  const area = $('body');

  if (!limit || count < limit) {
    let aList = area.find('a');

    if (excludeURL) {
      aList = aList.filter(function () {
        return !!$(this).attr('href') && !excludeURL.test($(this).attr('href'));
      });
    }

    aList.each(function () {
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

  const itemList = $(selectorString);

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

  itemList
    .filter(function () {
      if (!regexp) {
        return true;
      }
      return regexp.test($(this).text());
    })
    .each(function () {
      const $element = $(this);
      const tagName = this.tagName.toLowerCase();

      const { tags } = results[resultsLength];
      let idx = tags.findIndex(tag => tag.name === tagName);

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

  progressBar.update(++progressValue);
}

module.exports = scraping;
