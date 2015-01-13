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
          $scope.groupConfig = [];
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
          var max_length = 500;
          var pos = 0, last_pos = 0;
          while(pos < max_length) {
            var mapping = _.find(status[$scope.endpoint], {a:pos});
            // we found a group!
            if(mapping !== undefined) {
              // push any unknown bytes ahead of the found group
              if(last_pos < pos) {
                $scope.groupConfig.push({
                  'a': last_pos,
                  'b': pos
                });
              }
              // push found group
              $scope.groupConfig.push(mapping);
              pos = mapping.b;
              last_pos = mapping.b;
            }
            else {
              pos = pos + 1;
            }
          }

          // add final group
          $scope.groupConfig.push({
            'a': last_pos,
            'b': max_length
          });

          // add full-length conversions
          var extras = _.filter(status[$scope.endpoint], {a:undefined});
          _.forEach(extras, function(mapping){
            mapping.extra = true;
            $scope.groupConfig.push(mapping);
          });
        }, true);

        // hold current bytes on command
        $scope.heldBytes = undefined;
        $scope.$on('hold-bytes', function(){
          $scope.heldBytes = $scope.bytes;
          splitBytes($scope.bytes, $scope.heldBytes);
        });
        $scope.$on('hold-bytes-reset', function(){
          $scope.heldBytes = undefined;
          splitBytes($scope.bytes, $scope.heldBytes);
        });

        // split bytes into logical groups
        function splitBytes(bytes, heldBytes) {
          $scope.groups = [];
          _.forEach($scope.groupConfig, function(config){
            var group = _.cloneDeep(config);
            group.bytes = bytes.substring(config.a, config.b);
            if(heldBytes !== undefined)
              group.heldBytes = heldBytes.substring(config.a, config.b);
            $scope.groups.push(group);
          });
        }
        $scope.$watch('bytes', function(bytes){
          splitBytes(bytes, $scope.heldBytes);
        }, true);
      },
      templateUrl: 'components/byte-breakdown/byte-breakdown.html',
      replace: true
    };
  }]);

module.directive('byteDiff', ['$sce',
  function($sce) {
    return {
      restrict: 'E',
      transclude: false,
      scope: {
        group: '=',
      },
      controller: function($scope, $element){
        $scope.display = '';

        // recalculate character diff
        $scope.$watch('group', function(group){
          if(group.heldBytes === undefined) {
            $scope.display = $sce.trustAsHtml(group.bytes);
          }
          else {
            // calculate diff on individual characters
            var display = '';
            for(var i = 0; i < group.bytes.length; i++) {
              if(group.bytes[i] == group.heldBytes[i])
                display += group.bytes[i];
              else
                display += '<span>' + group.bytes[i] + '</span>';
            }
            $scope.display = $sce.trustAsHtml(display);
          }
        }, true);
      },
      template: '<span ng-class="{\'byte-diff\': group.heldBytes !== undefined && group.bytes != group.heldBytes}" ng-bind-html="display"></span>',
      replace: true
    };
  }]);

})(window, window._, window.angular);
