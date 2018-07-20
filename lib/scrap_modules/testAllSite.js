/*jshint esversion: 6 */

const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;
const Write = require('../write');

const entities = new Entities();
const write = new Write();

const queuedLinkList = [];
let count = 0;
let limit = 10;
let progressValue = 0;

write.startWriteStream('map.txt', {flags: 'a'});
write.message(`{`);

function sraping(params) {
  let {res, queue, results, selectorString, url, excludeURL, progressBar} = params;

  if (!progressValue) {
    progressBar.start(progressValue + 1, progressValue);
  }

  let $ = cheerio.load(res.body);
  const $area = $('body');

  if (!limit || count < limit) {

    let $aList = $area.find('a');

    if (excludeURL) {
      $aList = $aList.filter(function () {
        return !!$(this).attr('href') && !excludeURL.test($(this).attr('href'));
      });
    }

    $aList.each(function () {
      let link = $(this).attr('href');


      if (queuedLinkList.indexOf(link) === -1 && (!limit || count < limit)) {

        count++;

        queuedLinkList.push(link);
        write.message(`{page: "${link}"},`);
        queue.push(/^\//.test(link) ? link : `/${link}`);
        progressBar.setTotal(queuedLinkList.length);

      } else {

      }
    });

  }

  let $itemList = $(selectorString);
  let resultsLength = results.length - 1;

  if ($itemList.length) {
    results.push({
      page: url,
      path: url.replace(/(http:\/\/t02.gazprom.dev.design.ru\/?)|(\/$)/g, '').split('/'),
      tags: []
    });
    resultsLength++;
  }

  $itemList.each(function () {
    const $element = $(this);
    const tagName = this.tagName.toLowerCase();

    let tags = results[resultsLength].tags;
    let idx = tags.findIndex(tag => tag.name === tagName);

    if (!tags.length || idx === -1) {
      tags.push({
        name: tagName,
        list: []
      });
      idx = tags.length - 1;
    }

    tags[idx].list.push({
      text: $element.text(),
      html: entities.decode($('<div></div>').html($element.clone()).html())
    });

  });

  progressBar.update(++progressValue);
}

module.exports = sraping;
