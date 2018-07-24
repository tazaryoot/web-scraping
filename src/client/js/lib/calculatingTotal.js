/*jshint esversion: 6 */

/**
 * @param {Array} data
 * @returns {Array}
 */
export default function calculatingTotal(data = []) {
  let total = {
    pages: data.length,
    tags: []
  };

  data.reduce((pV, cV, idx) => {
    cV.tags.forEach(tag => {
      let elementIndex = total.tags.findIndex(element => element.name === tag.name);
      if (elementIndex === -1) {
        pV.tags.push({
          name: tag.name,
          accumulated: Number(tag.list.length)
        });
      } else {
        pV.tags[elementIndex].accumulated += Number(tag.list.length);
      }
    });

    return pV;
  }, total);

  return total;
}
