/*jshint esversion: 6 */

const needle = require('needle');
const tress = require('tress');
const cheerio = require('cheerio');
const perf = require('execution-time')();
const fs = require('fs');
const _cliProgress = require('cli-progress');

const urlCore = 'http://t02.gazprom.dev.design.ru';
const url = `${urlCore}/map/`;
/* const url = 'http://t02.gazprom.dev.design.ru/'; */

const progressBar =  new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
let progressValue = 0;

let results = {};

perf.start();

needle.defaults({
  open_timeout: 50
});

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
            .filter(function () {
              return $(this).attr('href').indexOf('/investor') !== -1;
            });

          progressBar.start($aList.length, progressValue);

          $aList.each(function () {
            let link = $(this).attr('href');

            if (link.indexOf('http') === -1) {
              link = `${urlCore}${link}`;
            }

            queue.push(link);
          });
        }


        let $h3List = $('h3');
        let $h4List = $('h4');

        if ($h3List.length || $h4List.length) {
          results[url] = {};
        }

        if ($h3List.length) {
          results[url].h3 = [];

          $h3List.each(function () {
            var $h3 = $(this);

            results[url].h3.push({
              text: $h3.text()
            });
          });
        }

        if ($h4List.length) {
          results[url].h4 = [];

          $h4List.each(function () {
            var $h4 = $(this);

            results[url].h4.push({
              text: $h4.text()
            });
          });
        }

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

function writeResults() {
  fs.writeFileSync('./result.json', JSON.stringify(results, null, 4, 'utf-8'));
}
