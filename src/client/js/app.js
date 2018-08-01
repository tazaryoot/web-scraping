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

    vm = new Vue({
      el: '#app',
      components: {
        MyHeader,
        Card,
        Pagination,
      },
      data: {
        total,
        mainData,
        step,
      },
      computed: {
        pageCount: function() {
            const step = this.step;
            const data = result;
            return  getPageCount({
              data,
              step,
            });
        }
      },
      methods: {
        nextPage: function() {
          console.log('next');
          this.mainData = result.slice(100, this.step + 100);
        },
        previousPage: function() {
          console.log('prev');
          this.mainData = result.slice(0, this.step);
        },
        showPage: function(start = 0) {
          console.log('showPage');
          this.mainData = result.slice(start, this.step + start);
        },
        changeElementOnPage: function(event) {
          console.log('cnahge');
          this.step = event.target.value;
          this.mainData = result.slice(0, this.step);
        }
      }
    });
  }

})();
