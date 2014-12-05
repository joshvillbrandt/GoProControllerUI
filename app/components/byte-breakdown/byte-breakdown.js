(function(window, _, angular, undefined) {
'use strict';

var module = angular.module('byteBreakdown', ['goProController']);

module.directive('byteBreakdown', ['CameraConfig',
  function(CameraConfig) {
    return {
      restrict: 'E',
      transclude: false,
      scope: {
        endpoint: '=',
        bytes: '=',
        status: '=',
      },
      controller: function($scope, $element){
        // grab translation config
        $scope.config = CameraConfig.get();

        // determine byte groupings from configs
        $scope.groupConfig = [];
        $scope.$watch('config', function(config){
          // make status config something searchable
          var status = {};
          _.forEach(config.status, function(value, key){
            var maps = [];
            _.forEach(value, function(mapping, name){
              mapping.name = name;
              maps.push(mapping);
            });
            status[key] = maps;
          });

          // now convert this into byte groups
          var pos = 0;
          while(pos < 500) {
            var mapping = _.find(status[$scope.endpoint], {a:pos});
            // we found a group!
            if(mapping !== undefined) {
              $scope.groupConfig.push(mapping);
              pos = mapping.b;
            }
            else {
              pos = pos + 1;
            }
          }
        }, true);

        // split bytes into logical groups
        $scope.$watch('bytes', function(bytes){
          $scope.groups = [];
          _.forEach($scope.groupConfig, function(config){
            var group = _.cloneDeep(config);
            group.bytes = bytes.substring(config.a, config.b);
            $scope.groups.push(group);
          });
        }, true);
      },
      templateUrl: 'components/byte-breakdown/byte-breakdown.html',
      replace: true
    };
  }]);

})(window, window._, window.angular);
