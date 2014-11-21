(function(window, angular, undefined) {

'use strict';

// define the module
var module = angular.module('controllerApi', ['ngCookies', 'ngResource']);
var api_root = 'http://localhost:8000';

module.factory('Settings', ['$rootScope', '$q', '$cookies', 'Telemetry',
  function($rootScope, $q, $cookies, Telemetry) {
    var deferred = $q.defer();

    var settings = {
      mission: undefined, //$cookies.mission,
      pollrate: $cookies.pollrate || 10000,
      token: $cookies.token,
      init_complete: deferred.promise
    };

    // initialize mission
    if(settings.mission !== undefined) deferred.resolve(settings);
    else {
      // this is the first visit, let's automatically grab the latest mission
      Telemetry.query({
        limit: 1,
        sort: '-_date'
      }).$promise.then(function(data){
        console.log('Initializing app with latest mission', data.items[0].mission);
        settings.mission = data.items[0].mission;
      });
    }

    // auto-save settings to cookies
    $rootScope.$watchCollection(function(){
      return settings;
    }, function(settings){
      $cookies.mission = settings.mission;
      $cookies.pollrate = settings.pollrate;
      $cookies.token = settings.token;
    });

    return settings;
  }
]);

module.factory('Vehicle', ['$resource',
  function($resource) {
    return $resource(
      api_root + '/vehicle/:id',
      {id:'@id'},
      {
        'query': {
          method: 'GET'
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

module.factory('Mission', ['$resource',
  function($resource) {
    return $resource(
      api_root + '/mission/:id',
      {id:'@id'},
      {
        'query': {
          method: 'GET'
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

module.factory('Telemetry', ['$resource',
  function($resource) {
    return $resource(
      api_root + '/telemetry/:id',
      {id:'@id'},
      {
        'query': {
          method: 'GET'
        }
      }
    );
  }
]);

module.factory('LiveTelemetry', ['$rootScope', '$interval', 'Settings', 'Telemetry',
  function($rootScope, $interval, Settings, Telemetry) {
    // state vars
    var items = [];

    // i shouldn't need these...
    var rad = function(x) {
      return x * Math.PI / 180;
    };
    var getDistance = function(p1, p2) {
      var R = 6378137; // Earth’s mean radius in meter
      var dLat = rad(p2.lat - p1.lat);
      var dLong = rad(p2.lng - p1.lng);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d; // returns the distance in meter
    };

    // calculate derived data
    var timezone_offset =  (new Date()).getTimezoneOffset() * 60000;
    var calculate_dt = function(b, a) {
      return (b.derived.time - a.derived.time) / 1000.0; // seconds
    };
    var calculate_dx = function(b, a) {
      // help! the LatLng function is returning undefined...why?!
      var from = {lat: a.data.latitude, lng: a.data.longitude};
      var to = {lat: b.data.latitude, lng: b.data.longitude};
      // var from = google.maps.LatLng(a.data.latitude, a.data.longitude);
      // var to = google.maps.LatLng(b.data.latitude, b.data.longitude);
      // help! the LatLng function is returning undefined...why?!
      // return google.maps.geometry.spherical.computeDistanceBetween(from, to);
      return getDistance(from, to); // m
    };
    var calculate_derived_data = function(new_items, old_items) {
      for(var i = 0; i < new_items.length; i++) {
        var derived = {
          time: undefined,
          dx: undefined,
          dt: undefined,
          v: undefined,
          p_thrusters: undefined,
          waypointHeading: undefined,
          waypointDistance: undefined,
          headingError: undefined,
        };
        new_items[i].derived = derived;

        // calculate time
        if(new_items[i].data._version >= 2)
          derived.time = new_items[i].data.time * 1000 - timezone_offset; // milliseconds
        else // fall back to API received time
          derived.time = new Date(new_items[i]._date).getTime() - timezone_offset;

        // calculate dx, dt, and v
        if(i === 0) {
          if(old_items.length > 0) {
            derived.dx = calculate_dx(new_items[i], old_items[old_items.length-1]);
            derived.dt = calculate_dt(new_items[i], old_items[old_items.length-1]);
          }
          else {
            // there was no previous data
            derived.dx = 0;
            derived.dt = 1;
          }
        }
        else {
          derived.dx = calculate_dx(new_items[i], new_items[i-1]);
          derived.dt = calculate_dt(new_items[i], new_items[i-1]);
        }
        derived.v = derived.dx / derived.dt;

        // temporary hack because of back time syncing (_version <= 1)
        if(new_items[i].data._version < 2 && derived.v > 1)
          derived.v = undefined;

        // p_thrusters
        derived.p_thrusters = new_items[i].data.p_left + new_items[i].data.p_right;

        // calculate waypointHeading and waypointDistance
        if(new_items[i].data.currentWaypointLatitude !== undefined) {
          var from = {lat: new_items[i].data.latitude, lng: new_items[i].data.longitude};
          var to = {lat: new_items[i].data.currentWaypointLatitude, lng: new_items[i].data.currentWaypointLongitude};
          derived.waypointDistance =  getDistance(from, to); // m
          derived.waypointHeading = google.maps.geometry.spherical.computeHeading(
            new google.maps.LatLng(from.lat, from.lng),
            new google.maps.LatLng(to.lat, to.lng));

          // heading error
          var a = new_items[i].data.heading, b = derived.waypointHeading;
          derived.headingError = Math.min(Math.abs(b-a), Math.abs(360-b+a),Math.abs(360-a+b));
        }
      }
    };

    // update function
    var update = function(mission) {
      var params = {
        sort: '-_date',
        limit: 1000,
        where: { mission: mission }
      };
      if(items.length > 0)
        params.where._date = { $gt: items[items.length - 1]._date };

      // stupid angular removes $gt, so stringify it ahead of time
      params.where = JSON.stringify(params.where);

      Telemetry.query(params, function(data){
        if(data.items.length > 0) {
          // reverse query sorting for calculating derived data
          data.items.reverse();
          calculate_derived_data(data.items, items);

          // add new items to the stack and notify listeners
          items = items.concat(data.items);
          console.log('Telemetry update:', data.items.length, 'new items');
          $rootScope.$broadcast('telemetry-update', data.items);
        }
      });
    };

    // public functions
    var promise;
    return {
      init: function(){
        $rootScope.$watch(function(){
          return Settings.mission;
        }, function(mission){
          if(mission !== undefined) {
            // settings have changed, re-initialize
            $rootScope.$broadcast('telemetry-init', []);
            if(promise) $interval.cancel(promise);
            items = []; // must always be sorted from news to oldest

            // create initial request
            console.log('Initiating live telemetry polling for', mission);
            update(mission);

            // periodically poll for updates
            promise = $interval(function(){
              update(mission);
            }, Settings.pollrate);
          }
        });
      },
      items: function(){
        return items;
      }
    };
  }
]);

module.factory('Command', ['$resource',
  function($resource) {
    return $resource(
      api_root + '/command/:id',
      {id:'@id'},
      {
        'query': {
          method: 'GET'
        },
        'create': {
          method: 'POST'
        }
      }
    );
  }
]);

module.factory('LiveCommand', ['$rootScope', '$interval', 'Settings', 'Command',
  function($rootScope, $interval, Settings, Command) {
    // state vars
    var items = [];

    // update function
    var update = function(mission) {
      var params = {
        sort: '-_date',
        limit: 1000,
        where: { mission: mission }
      };
      if(items.length > 0)
        params.where._date = { $gt: items[items.length - 1]._date };

      // stupid angular removes $gt, so stringify it ahead of time
      params.where = JSON.stringify(params.where);

      Command.query(params, function(data){
        if(data.items.length > 0) {
          // reverse query sorting for calculating derived data
          // newest to oldest from api, went oldest to newest here
          data.items.reverse();

          // add new items to the stack and notify listeners
          items = items.concat(data.items);
          console.log('Command update:', data.items.length, 'new items');
          $rootScope.$broadcast('command-update', data.items);
        }
      });
    };

    // public functions
    var promise;
    return {
      init: function(){
        $rootScope.$watch(function(){
          return Settings.mission;
        }, function(mission){
          if(mission !== undefined) {
            // settings have changed, re-initialize
            $rootScope.$broadcast('command-init', []);
            if(promise) $interval.cancel(promise);
            items = []; // must always be sorted from news to oldest

            // create initial request
            console.log('Initiating live command polling for', mission);
            update(mission);

            // periodically poll for updates
            promise = $interval(function(){
              update(mission);
            }, Settings.pollrate);
          }
        });
      },
      items: function(){
        return items;
      }
    };
  }
]);

})(window, window.angular);
