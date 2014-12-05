(function(window, angular, undefined) {
'use strict';

var module = angular.module('groupControl', []);

module.directive('groupControl', [
  function() {
    return {
      restrict: 'E',
      transclude: false,
      templateUrl: 'components/group-control/group-control.html',
      replace: false
    };
  }]);

})(window, window.angular);
