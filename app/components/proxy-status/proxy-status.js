(function(window, angular, undefined) {
'use strict';

var module = angular.module('proxyStatus', ['angularMoment', 'goProController']);

module.directive('proxyStatus', ['SyncedCameras',
  function(SyncedCameras) {
    return {
      restrict: 'E',
      scope: {},
      transclude: false,
      controller: function($scope, $element){
        $scope.status = 'proxy dead';
        var last_attempt;
        var ok_threshold = 20000; // ms

        // watch for updates
        $scope.cameras = SyncedCameras.items();
        $scope.$watch('cameras', function(cameras){
          // extract last_attempt time
          for(var i = 0; i < cameras.length; i++) {
            var attempt = new Date(cameras[i].last_attempt);
            if(last_attempt === undefined || attempt > last_attempt)
              last_attempt = attempt;
          }

          // evaluate proxy health
          if(last_attempt === undefined) $scope.status = 'proxy dead';
          else {
            var delta = (new Date()).getTime() - last_attempt.getTime();
            $scope.status = (delta <= ok_threshold) ? 'proxy ok' : 'proxy dead';
          }
        }, true);
      },
      template: '<span class="label proxy-status" ng-class="{\'label-primary\': status==\'proxy ok\', \'label-danger\': status==\'proxy dead\'}"><span class="glyphicon" ng-class="{\'glyphicon-ok\': status==\'proxy ok\', \'glyphicon-exclamation-sign\': status==\'proxy dead\'}"></span>{{status}}</span>',
      replace: true
    };
  }]);

})(window, window.angular);
