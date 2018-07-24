/*jshint esversion: 6 */
import Loading from './vue/loading/Loading.vue';
import MyHeader from './vue/my-header/MyHeader.vue';
import Card from './vue/card/Card.vue';

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

  getData()
  .then(result => {
    console.log('result', result);
    init(result);
  });

  function init(result = []) {
    mainData = result;
    vl.$data.isLoaded = true;

    let total = {
      pages: mainData.length,
      tags: []
    };

    total = mainData.reduce((pV, cV, idx) => {
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

    vm = new Vue({
      el: '#app',
      components: {
        MyHeader,
        Card
      },
      data: {
        mainData,
        total
      }
    });
  }
})();
