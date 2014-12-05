(function(window, angular, undefined) {
'use strict';

var module = angular.module('byteBreakdown', ['goProController']);

module.directive('byteBreakdown', ['CameraConfig',
  function(CameraConfig) {
    return {
      restrict: 'E',
      transclude: false,
      controller: function($scope, $element){
        // grab translation config
        $scope.config = CameraConfig.get();

        // split bytes into logical groups
        $scope.groups = [];
        $scope.$watch('bytes', function(bytes){
          var groups = [];
          var pos = 0;
          // while(pos < bytes.length) {
          //   translation
          // }
        }, true);
      },
      templateUrl: 'components/byte-breakdown/byte-breakdown.html',
      replace: true
    };
  }]);

})(window, window.angular);
