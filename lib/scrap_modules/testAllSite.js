/*jshint esversion: 6 */

const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;
const Write = require('../write');

const entities = new Entities();
const write = new Write();

const queuedLinkList = [];
let count = 0;
const LIMIT = 0;
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

  if (!LIMIT || count < LIMIT) {

    let $aList = $area.find('a');

    if (excludeURL) {
      $aList = $aList.filter(function () {
        return !!$(this).attr('href') && !excludeURL.test($(this).attr('href'));
      });
    }

    $aList.each(function () {
      let link = $(this).attr('href');


      if (queuedLinkList.indexOf(link) === -1 && (!LIMIT || count < LIMIT)) {

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

  if ($itemList.length) {
    results[url] = {};
  }

  $itemList.each(function () {
    const $element = $(this);
    const tagName = this.tagName.toLowerCase();

    if (!results[url].hasOwnProperty(tagName)) {
      results[url][tagName] = [];
    }

    results[url][tagName].push({
      text: $element.text(),
      html: entities.decode($('<div></div>').html($element.clone()).html())
    });

  });

  progressBar.update(++progressValue);
}

module.exports = sraping;
