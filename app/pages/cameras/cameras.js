(function(window, angular, undefined) {
'use strict';

var module = angular.module('page.cameras', ['ngCookies', 'goProController']);

module.controller('CamerasCtrl', [
  '$rootScope', '$scope', '$cookies', 'SyncedCameras', 'Cameras',
  function ($rootScope, $scope, $cookies, SyncedCameras, Cameras) {
    // view mode
    $scope.view = $cookies.view || 'list';
    $scope.setView = function(view){
      $cookies.view = view;
      $scope.view = view;
    };

    // per-camera edit mode
    $scope.toggleEditMode = function(camera){
      if(camera.$edit) {
        delete camera.$edit;
      }
      else {
        camera.$edit = {
          'ssid': camera.ssid,
          'password': camera.password
        };
      }
    };
    $scope.updateCamera = function(camera){
      var copy = angular.copy(camera);
      copy.ssid = copy.$edit.ssid;
      copy.password = copy.$edit.password;
      // would could be overwriting a newer status here, whoops
      copy.status = JSON.stringify(copy.status);
      copy.last_update = null; // this forces an immediate status check
      copy.$update();
      delete camera.$edit;
    };
    $scope.createCamera = function() {
      var camera = new Cameras();
      camera.ssid = 'new camera';
      camera.password = 'password';
      camera.$create();
    };
    $scope.deleteCamera = function(camera){
      camera.$delete();
      delete camera.$edit;
    };

    // pull cameras from service
    $scope.cameras = SyncedCameras.items();

    // inform group control to target a particular camera
    $scope.groupControlTarget = function(id){
      $rootScope.$broadcast('group-control-target', id);
    };
  }]);

})(window, window.angular);
