(function(window, Holder, angular, undefined) {
'use strict';

var module = angular.module('holder', []);

module.directive('holder', [
  function() {
    return {
      restrict: 'EA',
      transclude: false,
      template: '<img>',
      replace: true,
      link: function (scope, element, attrs) {
        Holder.run({ images: element[0] });
      }
    };
  }]);

})(window, window.Holder, window.angular);
