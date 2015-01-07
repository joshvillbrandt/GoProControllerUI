(function(window, angular, undefined) {
'use strict';

var module = angular.module('queuedCommands', []);

module.directive('queuedCommands', ['SyncedCommands', 'SyncedCameras', 'Commands',
  function(SyncedCommands, SyncedCameras, Commands) {
    return {
      restrict: 'E',
      transclude: false,
      controller: function($scope, $element) {
        // load commands
        $scope.commands = SyncedCommands.items();

        // only list uncompleted items
        $scope.unresolvedCommands = function(command) {
          return (command.time_completed === null);
        };

        // resolve camera names
        $scope.cameraName = function(id) {
          var camera = _.find(SyncedCameras.items(), {'id': id});
          return camera.ssid;
        };

        // delete command
        $scope.deleteCommand = function(id) {
          Commands.delete({'id': id});
        };

        // calculate average command delay
        $scope.cmd_delay = '?';
        $scope.$watch('commands', function(commands){
          var sum = 0, num = 0;
          for(var i = 0; i < commands.length; i++) {
            if(commands[i].time_completed !== null) {
              var d1 = (new Date(commands[i].date_added)).getTime();
              var d2 = (new Date(commands[i].time_completed)).getTime();

              sum = sum + (d2 - d1) / 1000;
              num = num + 1;
            }
          }

          // calculate average
          if(sum > 0)
            $scope.cmd_delay = Math.round(sum / num);
          else
            $scope.cmd_delay = '?';
        }, true);
      },
      templateUrl: 'components/queued-commands/queued-commands.html',
      replace: false
    };
  }]);

})(window, window.angular);
