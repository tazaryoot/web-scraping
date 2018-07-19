/*jshint esversion: 6 */

(function() {
  Vue.component('list-item', {
    props: ['item'],
    template: `<li><a v-bind:href="item.page">{{ item.path[item.path.length - 1] }}</a></li>`
  });

  Vue.component('list', {
    template: `list-item`
  });

  let getData = function() {
    return fetch('../assets/result.json')
    .then(response => {
      if(response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .catch(error => {
        console.error(`Fetch Error = \n ${error}`);
    });
  };


  let mainData;
  let vm;


  getData()
  .then(result => {
    console.log('result', result);
    init(result);
  });

  function init(result = []) {
    mainData = result;

    vm = new Vue({
      el: '#app',
      data: {
        mainData
      }
    });
  }
})();
