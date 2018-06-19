/*jshint esversion: 6 */

const needle = require('needle');
const tress = require('tress');
const cheerio = require('cheerio');
const perf = require('execution-time')();

const urlCore = 'http://t02.gazprom.dev.design.ru';
const url = `${urlCore}/map/`;
/* const url = 'http://t02.gazprom.dev.design.ru/'; */

let results = [];

perf.start();

try {
  let queue = tress((url, callback) => {

    console.info('url: ', url);

    needle.get(url, (err, res) => {

      if (err) {
        console.error('Get page error');
        throw err;
      }

      try {
        let $ = cheerio.load(res.body);

        const $area = $('#sitemap_cont');

        $area
          .find('a')
          .filter(function () {
            return $(this).attr('href').indexOf('/investor') !== -1;
          })
          .each(function () {
            let link = $(this).attr('href');

            if (link.indexOf('http') === -1) {
              link = `${urlCore}${link}`;
            }

            results.push({
              page: url,
              html: $(this).text()
            });

            queue.push(link);
          });

          let $h3 = $('h3');

          results.push({
            page: url,
            html: $h3.text()
          });

        callback();
      } catch (e) {
        console.error('Error in parse');
        throw e;
      }
    });

  });

  queue.drain = function() {
    require('fs').writeFileSync('./result.json', JSON.stringify(results, null, 4));

    let perfomance = perf.stop();
    console.warn('Executing time:', perfomance.verboseWords);
  };

  queue.push(url);
} catch (e) {
  console.error('Common error');
  throw e;
}

