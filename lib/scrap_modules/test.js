/*jshint esversion: 6 */

const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;

const entities = new Entities();
let progressValue = 0;

function sraping(params) {
  let {res, queue, results, progressBar, selectorString, url} = params;

  let $ = cheerio.load(res.body);

  const $area = $('#sitemap_cont');

  if ($area.length) {
    let $aList = $area
      .find('a')
      /* .filter(function () {
        return $(this).attr('href').indexOf('/investor') !== -1;
      }) */;

    progressBar.start($aList.length, progressValue);

    $aList.each(function () {
      let link = $(this).attr('href');

      queue.push(link);
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

  if (!$area.length) {
    progressBar.update(++progressValue);
  }
}

module.exports = sraping;
