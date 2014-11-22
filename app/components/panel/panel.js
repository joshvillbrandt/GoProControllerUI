(function(window, angular, undefined) {
'use strict';

var module = angular.module('panel', []);

module.directive('panel', [
  function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="panel panel-default" ng-transclude></div>',
      replace: true
    };
  }]);

module.directive('panelHeading', [
  function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="panel-heading"><h3 class="panel-title" ng-transclude></h3></div>',
      replace: true
    };
  }]);

module.directive('panelBody', [
  function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="panel-body" ng-transclude></div>',
      replace: true
    };
  }]);

module.directive('panelFooter', [
  function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="panel-footer text-muted" ng-transclude></div>',
      replace: true
    };
  }]);

})(window, window.angular);
