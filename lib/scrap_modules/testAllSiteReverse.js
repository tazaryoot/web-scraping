const cheerio = require('cheerio');
const FileWriter = require('../fileWriter');

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
function scraping({
  res,
  queue,
  results,
  selectorString,
  url,
  excludeURL,
  progressBar,
}) {
  if (!progressValue) {
    progressBar.start(progressValue + 1, progressValue);
  }

  const $ = cheerio.load(res.body);
  const area = $('body');

  const isRefresh = !!$('[http-equiv="refresh"]').length;

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

  if (!isRefresh) {
    const itemList = $(selectorString);

    if (!itemList.length) {
      results.push({
        page: url,
        title: $('title').text(),
      });
    }
  }

  if (!progressValue) {
    progressBar.update(++progressValue);
  }
}

module.exports = scraping;
