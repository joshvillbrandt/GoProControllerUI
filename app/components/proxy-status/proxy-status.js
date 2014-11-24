(function(window, angular, undefined) {
'use strict';

var module = angular.module('proxyStatus', ['angularMoment', 'goProController']);

module.directive('proxyStatus', ['SyncedCameras', '$interval',
  function(SyncedCameras, $interval) {
    return {
      restrict: 'E',
      scope: {},
      transclude: false,
      controller: function($scope, $element){
        // state vars
        $scope.cameras = SyncedCameras.items();
        $scope.status = 'proxy dead';
        var last_attempt;
        var ok_threshold = 20000; // ms

        // evaluate status
        var promise = $interval(function(){
          // extract last_attempt time
          for(var i = 0; i < $scope.cameras.length; i++) {
            var attempt = new Date($scope.cameras[i].last_attempt);
            if(last_attempt === undefined || attempt > last_attempt)
              last_attempt = attempt;
          }

          // evaluate proxy health
          if(last_attempt === undefined) $scope.status = 'proxy dead';
          else {
            var delta = (new Date()).getTime() - last_attempt.getTime();
            $scope.status = (delta <= ok_threshold) ? 'proxy ok' : 'proxy dead';
          }
        }, ok_threshold / 10);
      },
      template: '<span class="label proxy-status" ng-class="{\'label-primary\': status==\'proxy ok\', \'label-danger\': status==\'proxy dead\'}"><span class="glyphicon" ng-class="{\'glyphicon-ok\': status==\'proxy ok\', \'glyphicon-exclamation-sign\': status==\'proxy dead\'}"></span>{{status==\'proxy ok\'?\'connected\':\'disconnected\'}}</span>',
      replace: true
    };
  }]);

})(window, window.angular);
