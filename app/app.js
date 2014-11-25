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
  // pages
  'pageCameras',
]);

app.value('version', '0.2.0');
app.value('api_root', 'http://jvillbrandt-ubuntu');
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
    controller: 'StaticCtrl',
    reloadOnSearch: false
  });
  $routeProvider.otherwise({redirectTo: '/'});
}]);

// layout controller
app.controller('LayoutCtrl', ['$scope', '$rootScope', '$location', 'SyncedCameras',
  function ($scope, $rootScope, $location, SyncedCameras) {
    $scope.isActive = function (navBarPath) {
      return navBarPath === $location.path().split('/')[1];
    };
    $rootScope.$on('$routeChangeStart', function(){
      $scope.navCollapsed = true;
    });

    // init the LiveTelemetry process for the app
    SyncedCameras.init();
  }]);

// a generic static content controller
app.controller('StaticCtrl', ['$scope', function ($scope) {}]);

// hide moment Date() fallback warning
window.moment.suppressDeprecationWarnings = true;

})(window, window.angular);
