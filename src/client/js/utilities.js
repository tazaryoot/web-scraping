/*jshint esversion: 6 */
import groupingItemsByPath from './lib/groupingItemsByPath';

export default class Util {

  /**
   *
   * @param {Array} list
   * @returns {Promise}
   */
  getGroupingItems(list = []) {

    return new Promise((resolve, reject) => {
      let result = [];

      try {
        result = groupingItemsByPath(list);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }
}
