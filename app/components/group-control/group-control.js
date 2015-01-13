(function(window, angular, undefined) {
'use strict';

var module = angular.module('groupControl', ['ui.bootstrap']);

module.directive('groupControl', ['CameraConfig', 'SyncedCameras', 'Commands',
  function(CameraConfig, SyncedCameras, Commands) {
    return {
      restrict: 'E',
      transclude: false,
      controller: function($scope, $element) {
        // load command library
        $scope.config = CameraConfig.get();

        // load cameras
        $scope.cameras = SyncedCameras.items();
        $scope.targets = [];

        // submit camera commands
        $scope.submit = function(targets, command, value) {
          // create new command request
          for(var i = 0; i < targets.length; i++) {
            var request = new Commands();
            request.camera = targets[i];
            request.command = command;
            request.value = (value !== undefined) ? value : '';
            request.$create();
          }
        };

        // listen for camera select events from the camera list
        $scope.$on('group-control-target', function(event, data){
          $scope.targets = [data];
        });
      },
      templateUrl: 'components/group-control/group-control.html',
      replace: false
    };
  }]);

// originally from: http://jsfiddle.net/jaredwilli/vUSPu/
module.directive('groupControlDropdown', [
  function(){
    return {
      restrict: 'E',
      scope:{
        model: '=',
        options: '='
      },
      templateUrl: 'components/group-control/group-control-dropdown.html',
      replace: true,
      controller: function($scope){
        if($scope.model === undefined) $scope.model = [];

        // select dropdown helpers
        $scope.selectAll = function($event) {
          $scope.model = _.pluck($scope.options, 'id');

          $event.stopPropagation();
        };
        $scope.deselectAll = function($event) {
          $scope.model = [];

          $event.stopPropagation();
        };
        $scope.setSelectedItem = function($event){
          var id = this.option.id;

          if(_.contains($scope.model, id)) {
            $scope.model = _.without($scope.model, id);
          }
          else {
            $scope.model.push(id);
          }

          $event.stopPropagation();
        };
        $scope.isChecked = function(id) {
          if(_.contains($scope.model, id)) {
            return 'selected';
          }
          return false;
        };

        // select display helper
        $scope.modelNames = function() {
          var names = [];
          for(var i = 0; i < $scope.model.length; i++) {
            var option = _.find($scope.options, {'id': $scope.model[i]});
            names.push(option.ssid);
          }
          return names;
        };
      }
    };
  }]);

})(window, window.angular);
