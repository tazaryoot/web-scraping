/*jshint esversion: 6 */

function groupingResult(list, max, idx = 0) {
  let result = [];
  let __map = [];
  max = max || Math.max.apply(null, list.map(item => item.path.length));

  list.forEach(item => {
    if (item.path[idx]) {
      let path = item.path[idx];
      let index = __map.indexOf(path);

      if (index === -1) {
        __map.push(path);
        result.push({
            key: path,
            items: [],
            children: (idx <= max) ? groupingResult(list, max, (idx + 1)) : []
        });
        if (item.path.length === idx + 1) {
          result[__map.length - 1].items.push(item);
        }
      } else {
        result[index].children.push((idx <= max) ? groupingResult(list, max, (idx + 1)) : []);

        if (item.path.length === idx + 1) {
          result[index].items.push(item);
        }
      }
    }
  });
  return result;
}

module.exports = groupingResult;