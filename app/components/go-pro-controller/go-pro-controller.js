(function(window, _, angular, undefined) {
'use strict';

// define the module
var module = angular.module('goProController', ['ngCookies', 'ngResource']);

module.service('CameraConfig', ['$http', 'api_root',
  function($http, api_root) {
    // state vars
    var promise;
    var config = {};

    // public functions
    return {
      get: function(){
        if(promise === undefined) {
          promise = $http.get(api_root + '/config');

          // extend config object on success
          promise.success(function(data){
            angular.extend(config, data);
          });
        }

        return config;
      }
    };
  }
]);

module.factory('Commands', ['$resource', 'api_root',
  function($resource, api_root) {
    return $resource(
      api_root + '/commands/:id',
      {id:'@id'},
      {
        'query': {
          method: 'GET',
          isArray: true,
          transformResponse: function(data) {
            data = angular.fromJson(data);

            // API response when 'limit' is set
            if(data.results !== undefined) data = data.results;

            return data;
          }
        },
        'create': {
          method: 'POST'
        },
        'delete': {
          method: 'DELETE'
        }
      }
    );
  }
]);

module.service('SyncedCommands', ['$rootScope', '$interval', 'poll_rate', 'Commands',
  function($rootScope, $interval, poll_rate, Commands) {
    // state vars
    var items = [];

    // update function
    var update = function() {
      Commands.query({
        limit: 50,
        ordering: '-date_added'
      }, function(data){
        // take record of known items
        var known_items = [];
        for(var j = 0; j < items.length; j++) {
          known_items.push(items[j].id);
        }

        // update existing items list
        for(var i = 0; i < data.length; i++) {
          // update existing item or add new item
          var item = _.find(items, { 'id': data[i].id });
          if(item === undefined) {
            items.push(data[i]);
          }
          else _.assign(item, data[i]);

          // remove item from known_items list
          var index = known_items.indexOf(data[i].id);
          if(index >= 0) known_items.splice(index, 1);
        }

        // remove items from our list that are no longer in the database
        for(var k = 0; k < known_items.length; k++) {
          for(var l = 0; l < items.length; l++) {
            if(items[l].id == known_items[k]) {
              items.splice(l, 1);
              break;
            }
          }
        }
      });
    };

    // public functions
    var promise;
    return {
      init: function(){
        $rootScope.$broadcast('commands-init', []);
        if(promise) $interval.cancel(promise);
        items = []; // must always be sorted from news to oldest

        // create initial request
        console.log('Initiating live polling for commands');

        // periodically poll for updates
        promise = $interval(function(){
          update();
        }, poll_rate);
      },
      items: function(){
        return items;
      }
    };
  }
]);

module.factory('Cameras', ['$resource', 'api_root',
  function($resource, api_root) {
    return $resource(
      api_root + '/cameras/:id',
      {id:'@id'},
      {
        'query': {
          method: 'GET',
          isArray: true
        },
        'create': {
          method: 'POST'
        },
        'update': {
          method: 'PUT'
        }
      }
    );
  }
]);

module.service('SyncedCameras', ['$rootScope', '$interval', 'poll_rate', 'Cameras',
  function($rootScope, $interval, poll_rate, Cameras) {
    // state vars
    var items = [];

    // update function
    var update = function() {
      Cameras.query({}, function(data){
        // take record of known items
        var known_items = [];
        for(var j = 0; j < items.length; j++) {
          known_items.push(items[j].id);
        }

        // update existing items list
        for(var i = 0; i < data.length; i++) {
          // expand camera status field
          if(data[i].status.length)
            data[i].status = JSON.parse(data[i].status);

          // update existing item or add new item
          var item = _.find(items, { 'id': data[i].id });
          if(item === undefined) {
            item = data[i];
            items.push(item);
          }
          else _.assign(item, data[i]);

          // auto-edit for new cameras (this should match code in pages/cameras/cameras.js)
          if(!item.$edit && item.ssid == 'new camera') {
            item.$edit = {
              'ssid': item.ssid,
              'password': item.password
            };
          }
          // auto-unedit if this has been modified elsewhere
          else if(item.$edit && item.ssid != 'new camera' && item.$edit.ssid == 'new camera') {
            delete item.$edit;
          }

          // remove item from known_items list
          var index = known_items.indexOf(data[i].id);
          if(index >= 0) known_items.splice(index, 1);
        }

        // remove items from our list that are no longer in the database
        for(var k = 0; k < known_items.length; k++) {
          for(var l = 0; l < items.length; l++) {
            if(items[l].id == known_items[k]) {
              items.splice(l, 1);
              break;
            }
          }
        }

        // natural-sort cameras
        // items.sortNat();
        // extra shenanigans let us sort in place because sortNat() is acting weird
        var sorted = _.sortByNat(items, 'ssid');
        _.remove(items, function(){ return true; }); // removes all elements
        items.push.apply(items, sorted);
      });
    };

    // public functions
    var promise;
    return {
      init: function(){
        $rootScope.$broadcast('cameras-init', []);
        if(promise) $interval.cancel(promise);
        items = []; // must always be sorted from news to oldest

        // create initial request
        console.log('Initiating live polling for cameras');

        // periodically poll for updates
        promise = $interval(function(){
          update();
        }, poll_rate);
      },
      items: function(){
        return items;
      }
    };
  }
]);

})(window, window._, window.angular);
