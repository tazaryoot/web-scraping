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
  const beforeUpdated = function() {
    console.info(`${this.$options.name} beforeUpdated`);
  };
  const updated = function() {
    console.info(`${this.$options.name} updated`);
  };

  Vue.component('card', {
    props: ['page'],
    name: 'card',
    beforeCreated,
    created,
    beforeMount,
    mounted,
    template: `<div class="mdl-card mdl-shadow--2dp">
                  <template v-for="tag in page.tags">
                    <div class="mdl-card__title">
                      <h4 class="mdl-card__title-text">Селектор: {{tag.name}}</h4>
                    </div>
                    <div class="mdl-card__supporting-text">
                      <list
                        :list="tag.list">
                      </list>
                    </div>
                  </template>
                  <div class="mdl-card__actions mdl-card--border">
                    <a class="mdl-color-text--grey-800" :href="page.page">Page: {{page.page}}</a>
                  </div>
                </div>`
  });

  Vue.component('list', {
    props: ['list'],
    name: 'list',
    beforeCreated,
    created,
    beforeMount,
    mounted,
    template: `<ul class="mdl-list">
                <list-item
                  v-for="item in list"
                  :item="item">
                </list-item>
              </ul>`
  });

  Vue.component('list-item', {
    props: ['item'],
    name: 'list-item',
    template: `<li class="mdl-list__item">
                <span class="mdl-list__item-primary-content">
                  <span class="mdl-list__item-text-body">
                    {{item.text}}
                  </span>
                </span>
              </li>`
  });

  Vue.component('pagination', {
    props: ['start', 'step'],
    name: 'pagination',
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

  Vue.component('my-header', {
    props: ['total'],
    template: `<header class="mdl-layout__header">
                <div class="mdl-layout__header-row">
                  <p><b>Найдено:</b></p>
                  <p v-for="tag in total.tags">{{tag.name}}: {{tag.accumulated}}</p>
                  <p>на {{total.pages}} страницах</p>
                </div>
              </header>`
  });

  Vue.component('loading', {
    name: 'loading',
    props: ['loaded'],
    beforeUpdated,
    template: `<div v-show="!loaded" class="ne-loading">
                <div id="p2" class="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div>
              </div>`
  });

  let mainData;
  let vm;
  let vl = new Vue({
    el: '#loading',
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
      data: {
        mainData,
        start: 1,
        step: 100,
        total
      }
    });
  }
})();
