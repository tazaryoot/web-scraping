/*jshint esversion: 6 */
import Loading from './vue/loading/Loading.vue';
import MyHeader from './vue/my-header/MyHeader.vue';
import Card from './vue/card/Card.vue';
import Pagination from './vue/pagination/Pagination.vue';
import calculatingTotal from './lib/calculatingTotal';
import getData from './lib/getData';

(function() {
  let mainData;
  let vm;

  let vl = new Vue({
    el: '#loading',
    components: {
      Loading
    },
    data: {
        isLoaded: false
    },
    computed: {
      compIsLoaded: function() {
        return this.isLoaded;
      }
    }
  });

  getData('../assets/result.json')
    .then(result => {
      console.log('result', result);
      init(result);
    });

  function init(result = []) {
    mainData = result;
    vl.$data.isLoaded = true;

    let total = calculatingTotal(mainData);

    vm = new Vue({
      el: '#app',
      components: {
        MyHeader,
        Card,
        Pagination,
      },
      data: {
        mainData,
        total,
      }
    });
  }

})();
