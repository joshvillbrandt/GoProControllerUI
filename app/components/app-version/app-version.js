(function(window, angular, undefined) {
'use strict';

var module = angular.module('valueDirectives', []);

module.directive('appVersion', ['version',
  function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);

module.directive('appApiRoot', ['api_root',
  function(api_root) {
    return function(scope, elm, attrs) {
      elm.text(api_root);
    };
  }]);

module.directive('appPollRate', ['poll_rate',
  function(poll_rate) {
    return function(scope, elm, attrs) {
      elm.text(poll_rate);
    };
  }]);

})(window, window.angular);
