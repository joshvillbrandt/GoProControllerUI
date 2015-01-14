(function(window, angular, undefined) {

'use strict';

// declare app level module
var app = angular.module('app', [
  // angular and third-party modules
  'ngRoute',
  'ngCookies',
  'ui.bootstrap',
  // components
  'appVersion',
  'holder',
  'panel',
  'goProController',
  'proxyStatus',
  'cameraStatus',
  'blurOnClick',
  'groupControl',
  'queuedCommands',
  'byteBreakdown',
  // pages
  'page.cameras',
  'page.debug',
]);

app.value('version', '0.2.3');
app.value('api_root', 'http://localhost:8000');
app.value('poll_rate', 1000); // ms

// app routing
app.config(['$routeProvider', '$httpProvider', '$locationProvider',
    function($routeProvider, $httpProvider, $locationProvider) {
  // html5mode
  $locationProvider.html5Mode(true);

  // routes
  $routeProvider.when('/', {
    templateUrl: 'pages/cameras/cameras.html',
    controller: 'CamerasCtrl',
    reloadOnSearch: false
  });
  $routeProvider.when('/debug', {
    templateUrl: 'pages/debug/debug.html',
    controller: 'DebugCtrl',
    reloadOnSearch: false
  });
  $routeProvider.otherwise({redirectTo: '/'});
}]);

// layout controller
app.controller('LayoutCtrl', ['$scope', '$rootScope', '$location', 'SyncedCameras', 'SyncedCommands',
  function ($scope, $rootScope, $location, SyncedCameras, SyncedCommands) {
    $scope.isActive = function (navBarPath) {
      return navBarPath === $location.path().split('/')[1];
    };
    $rootScope.$on('$routeChangeStart', function(){
      $scope.navCollapsed = true;
    });

    // init the model syncing
    SyncedCameras.init();
    SyncedCommands.init();
  }]);

// a generic static content controller
app.controller('StaticCtrl', ['$scope', function ($scope) {}]);

// hide moment Date() fallback warning
window.moment.suppressDeprecationWarnings = true;

})(window, window.angular);
