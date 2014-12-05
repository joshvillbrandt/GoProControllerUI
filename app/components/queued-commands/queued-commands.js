(function(window, angular, undefined) {
'use strict';

var module = angular.module('queuedCommands', []);

module.directive('queuedCommands', [
  function() {
    return {
      restrict: 'E',
      transclude: false,
      templateUrl: 'components/queued-commands/queued-commands.html',
      replace: false
    };
  }]);

})(window, window.angular);
