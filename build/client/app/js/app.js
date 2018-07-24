/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/client/js/app.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/client/js/app.js":
/*!******************************!*\
  !*** ./src/client/js/app.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/*jshint esversion: 6 */\n\n(function () {\n  var beforeCreated = function beforeCreated() {\n    //console.info(`${this.$options.name} beforeCreated`);\n  };\n  var created = function created() {\n    //console.info(`${this.$options.name} created`);\n  };\n  var beforeMount = function beforeMount() {\n    //console.info(`${this.$options.name} beforeMount`);\n  };\n  var mounted = function mounted() {\n    //console.info(`${this.$options.name} mounted`);\n  };\n  var beforeUpdated = function beforeUpdated() {\n    console.info(this.$options.name + ' beforeUpdated');\n  };\n  var updated = function updated() {\n    console.info(this.$options.name + ' updated');\n  };\n\n  Vue.component('card', {\n    props: ['page'],\n    name: 'card',\n    beforeCreated: beforeCreated,\n    created: created,\n    beforeMount: beforeMount,\n    mounted: mounted,\n    template: '<div class=\"mdl-card mdl-shadow--2dp\">\\n                  <template v-for=\"tag in page.tags\">\\n                    <div class=\"mdl-card__title\">\\n                      <h4 class=\"mdl-card__title-text\">\\u0421\\u0435\\u043B\\u0435\\u043A\\u0442\\u043E\\u0440: {{tag.name}}</h4>\\n                    </div>\\n                    <div class=\"mdl-card__supporting-text\">\\n                      <list\\n                        :list=\"tag.list\">\\n                      </list>\\n                    </div>\\n                  </template>\\n                  <div class=\"mdl-card__actions mdl-card--border\">\\n                    <a class=\"mdl-color-text--grey-800\" :href=\"page.page\">Page: {{page.page}}</a>\\n                  </div>\\n                </div>'\n  });\n\n  Vue.component('list', {\n    props: ['list'],\n    name: 'list',\n    beforeCreated: beforeCreated,\n    created: created,\n    beforeMount: beforeMount,\n    mounted: mounted,\n    template: '<ul class=\"mdl-list\">\\n                <list-item\\n                  v-for=\"item in list\"\\n                  :item=\"item\">\\n                </list-item>\\n              </ul>'\n  });\n\n  Vue.component('list-item', {\n    props: ['item'],\n    name: 'list-item',\n    template: '<li class=\"mdl-list__item\">\\n                <span class=\"mdl-list__item-primary-content\">\\n                  <span class=\"mdl-list__item-text-body\">\\n                    {{item.text}}\\n                  </span>\\n                </span>\\n              </li>'\n  });\n\n  Vue.component('pagination', {\n    props: ['start', 'step'],\n    name: 'pagination',\n    template: '<div class=\"ne-button-group\">\\n                <a class=\"ne-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent\" @click=\"next\">Next</a>\\n                <a class=\"ne-button\" @click=\"previous\">Previous</a>\\n              </div>',\n    methods: {\n      next: function next() {\n        console.log('next');\n      },\n      previous: function previous() {\n        console.log('previous');\n      }\n    }\n  });\n\n  Vue.component('my-header', {\n    props: ['total'],\n    template: '<header class=\"mdl-layout__header\">\\n                <div class=\"mdl-layout__header-row\">\\n                  <p><b>\\u041D\\u0430\\u0439\\u0434\\u0435\\u043D\\u043E:</b></p>\\n                  <p v-for=\"tag in total.tags\">{{tag.name}}: {{tag.accumulated}}</p>\\n                  <p>\\u043D\\u0430 {{total.pages}} \\u0441\\u0442\\u0440\\u0430\\u043D\\u0438\\u0446\\u0430\\u0445</p>\\n                </div>\\n              </header>'\n  });\n\n  Vue.component('loading', {\n    name: 'loading',\n    props: ['loaded'],\n    beforeUpdated: beforeUpdated,\n    template: '<div v-show=\"!loaded\" class=\"ne-loading\">\\n                <div id=\"p2\" class=\"mdl-progress mdl-js-progress mdl-progress__indeterminate\"></div>\\n              </div>'\n  });\n\n  var mainData = void 0;\n  var vm = void 0;\n  var vl = new Vue({\n    el: '#loading',\n    data: {\n      isLoaded: false\n    },\n    computed: {\n      compIsLoaded: function compIsLoaded() {\n        return this.isLoaded;\n      }\n    }\n  });\n\n  var getData = function getData() {\n    return fetch('../assets/result.json').then(function (response) {\n      if (response.ok) {\n        return response.json();\n      }\n      throw new Error('Network response was not ok.');\n    }).catch(function (error) {\n      console.error('Fetch Error = \\n ' + error);\n    });\n  };\n\n  getData().then(function (result) {\n    console.log('result', result);\n    init(result);\n  });\n\n  function init() {\n    var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];\n\n    mainData = result;\n    vl.$data.isLoaded = true;\n\n    var total = {\n      pages: mainData.length,\n      tags: []\n    };\n\n    total = mainData.reduce(function (pV, cV, idx) {\n      cV.tags.forEach(function (tag) {\n        var elementIndex = total.tags.findIndex(function (element) {\n          return element.name === tag.name;\n        });\n        if (elementIndex === -1) {\n          pV.tags.push({\n            name: tag.name,\n            accumulated: Number(tag.list.length)\n          });\n        } else {\n          pV.tags[elementIndex].accumulated += Number(tag.list.length);\n        }\n      });\n\n      return pV;\n    }, total);\n\n    vm = new Vue({\n      el: '#app',\n      data: {\n        mainData: mainData,\n        start: 1,\n        step: 100,\n        total: total\n      }\n    });\n  }\n})();\n\n//# sourceURL=webpack:///./src/client/js/app.js?");

/***/ })

/******/ });