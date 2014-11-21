(function(window, angular, undefined) {
'use strict';

var module = angular.module('appVersion', []);

module.directive('appVersion', ['version',
  function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);

})(window, window.angular);
