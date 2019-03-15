const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;

const entities = new Entities();
let progressValue = 0;

function scraping(params) {
  const {
    res, queue, results, progressBar, selectorString, url,
  } = params;

  const $ = cheerio.load(res.body);

  const $area = $('#sitemap_cont');

  if ($area.length) {
    const $aList = $area
      .find('a')
      /* .filter(function () {
        return $(this).attr('href').indexOf('/investor') !== -1;
      }) */;

    progressBar.start($aList.length, progressValue);

    $aList.each(() => {
      const link = $(this).attr('href');

      queue.push(link);
    });
  }

  const $itemList = $(selectorString);

  if ($itemList.length) {
    results[url] = {};
  }

  $itemList.each(() => {
    const $element = $(this);
    const tagName = this.tagName.toLowerCase();

    if (!results[url].hasOwnProperty(tagName)) {
      results[url][tagName] = [];
    }

    results[url][tagName].push({
      text: $element.text(),
      html: entities.decode($('<div></div>').html($element.clone()).html()),
    });
  });

  if (!$area.length) {
    progressBar.update(++progressValue);
  }
}

module.exports = scraping;
