(function(window, angular, undefined) {
'use strict';

var module = angular.module('blurOnClick', []);

module.directive('blurOnClick', [
  function() {
    return {
      restrict: 'A',
      transclude: false,
      link: function(scope, elem, attrs){
        elem.bind('click', function() {
          elem[0].blur();
        });
      },
      replace: false
    };
  }]);

})(window, window.angular);
