(function(window, angular, undefined) {
'use strict';

var module = angular.module('cameraStatus', []);

module.directive('cameraStatus', [
  function() {
    return {
      restrict: 'E',
      scope: {
        'status': '='
      },
      transclude: true,
      controller: function($scope, $element){
        $scope.color = 'default';

        // watch for updates
        $scope.$watch('status', function(status){
          if(status == 'sleeping') $scope.color = 'warning';
          else if(status == 'on') $scope.color = 'success';
          else if(status == 'recording') $scope.color = 'danger';
          else $scope.color = 'default';
        });
      },
      template: '<span class="label label-{{color}} camera-status" ng-transclude></span>',
      replace: true
    };
  }]);

})(window, window.angular);
