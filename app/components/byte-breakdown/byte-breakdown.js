(function(window, angular, undefined) {
'use strict';

var module = angular.module('byteBreakdown', ['goProController']);

module.directive('byteBreakdown', ['CameraConfig',
  function(CameraConfig) {
    return {
      restrict: 'E',
      transclude: false,
      controller: function($scope, $element){
        $scope.config = CameraConfig.get();
      },
      templateUrl: 'components/byte-breakdown/byte-breakdown.html',
      replace: true
    };
  }]);

})(window, window.angular);
