(function(window, angular, undefined) {
'use strict';

var module = angular.module('cameraStatus', []);

module.directive('cameraStatus', [
  function() {
    return {
      restrict: 'E',
      scope: {
        'camera': '='
      },
      transclude: false,
      controller: function($scope, $element){
        $scope.$watch('camera', function(camera){
          $scope.status = 'notfound';
          if(camera.status.record == 'on')
            $scope.status = 'recording';
        });
      },
      template: '<span class="camera-status" ng-class="{\'camera-status-notfound\': status==\'notfound\'}"></span>',
      replace: true
    };
  }]);

})(window, window.angular);
