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
eval("\n\n/*jshint esversion: 6 */\n\n(function () {\n\n  var mainData = void 0;\n\n  Vue.component('list-item', {\n    props: ['page'],\n    template: '<li><a :href=\"page\">{{ page }}</a></li>'\n  });\n\n  Vue.component('list', {\n    props: ['data'],\n    template: '<list-item\\n                v-for=\"item in data\"\\n                v-bind:page=\"item.page\">\\n                </list-item>'\n  });\n\n  var getData = function getData() {\n    return fetch('../assets/result.json').then(function (response) {\n      if (response.ok) {\n        return response.json();\n      }\n      throw new Error('Network response was not ok.');\n    }).catch(function (error) {\n      console.error('Fetch Error = \\n ' + error);\n    });\n  };\n\n  window.addEventListener('load', function () {\n    getData().then(function (result) {\n      console.log('result', result);\n      init(result);\n    });\n  });\n\n  function init() {\n    var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];\n\n    mainData = result;\n\n    new Vue({\n      el: '#app',\n      data: {\n        mainData: mainData\n      }\n    });\n  }\n})();\n\n//# sourceURL=webpack:///./src/client/js/app.js?");

/***/ })

/******/ });