/*jshint esversion: 6 */

const fs = require('fs');

function writeResults() {
  fs.writeFileSync('./result.json', JSON.stringify(results, null, 4, 'utf-8'));
}

module.exports = writeResults;
