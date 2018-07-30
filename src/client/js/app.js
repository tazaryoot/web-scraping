/*jshint esversion: 6 */
import Loading from './vue/loading/Loading.vue';
import MyHeader from './vue/my-header/MyHeader.vue';
import Card from './vue/card/Card.vue';
import Pagination from './vue/pagination/Pagination.vue';
import calculatingTotal from './lib/calculatingTotal';
import getData from './lib/getData';
import getPageCount from './lib/getPageCount';

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
      init(result);
    });

  function init(result = []) {
    const step = 100;

    mainData = result.splice(0, step);
    vl.$data.isLoaded = true;

    let total = calculatingTotal(result);
    let pageCount = getPageCount({
      data: result,
      step
    });

    vm = new Vue({
      el: '#app',
      components: {
        MyHeader,
        Card,
        Pagination,
      },
      data: {
        total,
        pageCount,
        mainData,
        step,
      },
      computed: {

      },
      methods: {
        next: function() {
          console.log('next');
          this.mainData = result.slice(100, step + 100);
        },
        previous: function() {
          console.log('prev');
          this.mainData = result.slice(0, step);
        },
        showPage: function(start = 0) {
          console.log('showPage');
          this.mainData = result.slice(start, step + start);
        },
      }
    });
  }

})();
