/*jshint esversion: 6 */

/**
 * @typedef {object} PageCountParams
 * @property {array} client
 * @property {number} step
 */
/**
 * @param {PageCountParams} params
 * @returns {number}
 */
export default function getPageCount(params) {
  let {data = [], step = 1} = params;

  let count = 0;

  if (step <= 0 ) {
    console.warn('step <= 0');
    count = 0;
  } else {
    count = (data.length - data.length % step) / step;
  }

  return count;
}
