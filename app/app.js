(function(window, angular, undefined) {

'use strict';

// declare app level module
var app = angular.module('app', [
    // angular modules
    'ngRoute',
    // third-party modules
    'ui.bootstrap',
    // components
    'appVersion',
    // 'controllerApi',
    // 'proxyStatus',
]);

app.value('version', '0.1.0');

// app routing
app.config(['$routeProvider', '$httpProvider', '$locationProvider',
        function($routeProvider, $httpProvider, $locationProvider) {
    // html5mode
    $locationProvider.html5Mode(true);

    // routes
    $routeProvider.when('/', {
        templateUrl: 'pages/cameras/cameras.html',
        controller: 'StaticCtrl',
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
app.controller('LayoutCtrl', ['$scope', '$rootScope', '$location',
  function ($scope, $rootScope, $location) {
    $scope.isActive = function (navBarPath) {
      return navBarPath === $location.path().split('/')[1];
    };
    $rootScope.$on('$routeChangeStart', function(){
      $scope.navCollapsed = true;
    });

    // init the LiveTelemetry process for the app
    // LiveTelemetry.init();
    // LiveCommand.init();
  }]);

// a generic static content controller
app.controller('StaticCtrl', ['$scope', function ($scope) {}]);

// hide moment Date() fallback warning
window.moment.suppressDeprecationWarnings = true;

})(window, window.angular);
