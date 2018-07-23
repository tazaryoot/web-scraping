/*jshint esversion: 6 */

(function() {
  const beforeCreated = function() {
    //console.info(`${this.$options.name} beforeCreated`);
  };
  const created = function() {
    //console.info(`${this.$options.name} created`);
  };
  const beforeMount = function() {
    //console.info(`${this.$options.name} beforeMount`);
  };
  const mounted = function() {
    //console.info(`${this.$options.name} mounted`);
  };

  Vue.component('list', {
    props: ['list', 'start', 'step'],
    name: 'list',
    beforeCreated,
    created,
    beforeMount,
    mounted,
    data: function() {
      return {
        trimmedList: this.list.splice(this.step, this.step)
      };
    },
    template: `<ul class="mdl-list">
                <list-item
                  v-for="item in trimmedList"
                  :item="item">
                </list-item>
              </ul>`
  });

  Vue.component('list-item', {
    props: ['item'],
    name: 'list-item',
    beforeCreated,
    created,
    beforeMount,
    mounted,
    template: `<li class="mdl-list__item">
                <span class="mdl-list__item-primary-content">
                  <a :href="item.page">
                    {{ item.page }}
                  </a>
                </span>
              </li>`
  });

  Vue.component('pagination', {
    props: ['start', 'step'],
    name: 'pagination',
    beforeCreated,
    created,
    beforeMount,
    mounted,
    template: `<div class="ne-button-group">
                <a class="ne-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" @click="next">Next</a>
                <a class="ne-button" @click="previous">Previous</a>
              </div>`,
    methods: {
      next: function() {
        console.log('next');
      },
      previous: function() {
        console.log('previous');
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

    vm = new Vue({
      el: '#app',
      data: {
        mainData,
        start: 1,
        step: 100
      }
    });
  }
})();
