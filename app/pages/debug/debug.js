(function(window, _, angular, undefined) {
'use strict';

var module = angular.module('page.debug', ['ngCookies', 'goProController']);

module.controller('DebugCtrl', [
  '$scope', '$cookies', 'SyncedCameras',
  function ($scope, $cookies, SyncedCameras) {
    // pull cameras from service
    $scope.cameras = SyncedCameras.items();

    // init selected camera
    $scope.$watchCollection('cameras', function(cameras){
      if($scope.selected === undefined && cameras.length > 0) {
        $scope.selected = cameras[0].id;
      }
    });

    // auto-populate the camera scope variable
    $scope.$watch('selected', function(selected){
      $scope.camera = _.find($scope.cameras, { 'id': selected });
    }, true);
  }]);

})(window, window._, window.angular);
