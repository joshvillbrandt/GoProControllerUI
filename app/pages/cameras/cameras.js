(function(window, angular, undefined) {
'use strict';

var module = angular.module('pageCameras', ['ngCookies', 'goProController']);

module.controller('CamerasCtrl', [
  '$scope', '$cookies', 'SyncedCameras',
  function ($scope, $cookies, SyncedCameras) {
    // view mode
    $scope.view = $cookies.view || 'list';
    $scope.setView = function(view){
      $cookies.view = view;
      $scope.view = view;
    };

    // pull cameras from service
    $scope.cameras = SyncedCameras.items();
  }]);

})(window, window.angular);
