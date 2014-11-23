(function(window, _, angular, undefined) {
'use strict';

// define the module
var module = angular.module('goProController', ['ngCookies', 'ngResource']);

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
      var params = {
        // sort: '-_date',
        // limit: 1000,
        // where: { mission: mission }
      };
      // if(items.length > 0)
      //   params.where._date = { $gt: items[items.length - 1]._date };

      // stupid angular removes $gt, so stringify it ahead of time
      // params.where = JSON.stringify(params.where);

      Cameras.query(params, function(data){
        // update existing items list
        // items = data;
        for(var i = 0; i < data.length; i++) {
          // expand status field
          if(data[i].status.length)
            data[i].status = JSON.parse(data[i].status);
          // update existing item or add new item
          var item = _.find(items, { 'id': data[i].id });
          if(item === undefined) items.push(data[i]);
          else _.assign(item, data[i]);
        }
        //
        // console.log(data)
        // if(data.items.length > 0) {
        //   // reverse query sorting for calculating derived data
        //   // newest to oldest from api, went oldest to newest here
        //   data.items.reverse();

        //   // add new items to the stack and notify listeners
        //   items = items.concat(data.items);
        //   console.log('Cameras update:', data.items.length, 'new items');
        //   $rootScope.$broadcast('cameras-update', data.items);
        // }
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
