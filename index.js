/*jshint esversion: 6 */

const needle = require('needle');
const tress = require('tress');
const cheerio = require('cheerio');
const perf = require('execution-time')();
const _cliProgress = require('cli-progress');
const Entities = require('html-entities').XmlEntities;
const writeResults = require('./lib/write');

const urlCore = 'http://t02.gazprom.dev.design.ru';
const url = `${urlCore}/map/`;
/* const url = 'http://t02.gazprom.dev.design.ru/'; */

const progressBar =  new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
let progressValue = 0;

const entities = new Entities();

let results = {};

perf.start();

/* needle.defaults({
  open_timeout: 50
}); */

try {
  let queue = tress((url, callback) => {

    //console.info('get url: ', url);

    needle.get(url, (err, res) => {

      if (err) {
        console.error('Get page error');
        writeResults();
        return;
      }

      try {
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

            if (link.indexOf('http') === -1) {
              link = `${urlCore}${link}`;
            }

            queue.push(link);
          });
        }


        let $itemList = $('h3').add('h4');

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

        callback();
      } catch (e) {
        console.error('Error in parse');
        writeResults();
        throw e;
      }
    });

  });

  queue.drain = function() {
    writeResults();

    progressBar.stop();
    let perfomance = perf.stop();
    console.warn('Executing time:', perfomance.verboseWords);
  };

  queue.push(url);
} catch (e) {
  console.error('Common error');
  writeResults();
  throw e;
}
