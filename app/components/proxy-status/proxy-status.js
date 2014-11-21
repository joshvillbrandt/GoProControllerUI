(function(window, angular, undefined) {
'use strict';

var module = angular.module('proxyStatus', ['controllApi', 'angularMoment']);

module.directive('proxyStatus', ['Cameras',
  function(LiveTelemetry) {
    return {
      restrict: 'E',
      transclude: false,
      controller: function($scope, $element){
        // initial data
        $scope.last_update = undefined;

        // respond to LiveTelemetry updates
        $scope.$on('telemetry-init', function(event, items) {
          $scope.last_update = undefined;
        });
        $scope.$on('telemetry-update', function(event, items) {
          if(items.length > 0)
            $scope.last_update = items[items.length - 1]._date;
        });
      },
      template: '<span class="label label-primary tlm-status"><span class="glyphicon glyphicon-time"></span> <span am-time-ago="last_update" ng-if="last_update"></span><span ng-if="!last_update">no tlm</span></span>',
      replace: true
    };
  }]);

})(window, window.angular);
