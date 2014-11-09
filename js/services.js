'use strict';

var servicesModule = angular.module('myApp.services', [])

// define a constant
servicesModule.constant('apiPath', 'http://151.236.10.206/dev/swappers/api/');

/* ----------------- services -----------------*/


servicesModule.service('UserDataService', function() {

  var userdata = {
    'name': '',
    'isLogged': false
  };

  this.getName = function() {
    return userdata.name
  };
  this.setName = function(newName) {
    userdata.name = newName
  };

  this.getStatus = function() {
    return userdata.isLogged
  };
  this.setStatus = function(status) {
    userdata.isLogged = status
  };
});


/* ----------------- factories -----------------*/


// use it in a service
servicesModule.factory('ConstantProvider', ['apiPath', function(apiPath){
   return {
       getApiPath: function () {
          return apiPath; //blah
       }
   };
}]);


servicesModule.factory('HttpConnectorService', function($http) {

  return {
    connectTo: function(url, postobject, callback) {
      $http({
        method: 'POST',
        url: url,
        data: postobject,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(callback)
    },
    removeItem: function(data, callback) {
      $http({
        method: 'PUT',
        url: 'http://151.236.10.206/dev/swappers/api/collection/',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(callback)
    },
    borrowItem: function(data, callback) {
      $http({
        method: 'PUT',
        url: 'http://151.236.10.206/dev/swappers/api/transaction/',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(callback)
    },
    deleteItemFromDB: function(data, callback) {
      $http({
        method: 'DELETE',
        url: 'http://151.236.10.206/dev/swappers/api/item/',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(callback)
    },
    initTransaction: function(data, callback) {
      $http({
        method: 'POST',
        url: 'http://151.236.10.206/dev/swappers/api/transaction/',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(callback)
    }
  }
});



servicesModule.factory('Wizard', function() {

  return {
    Notify: function(message) {
      return message;
    }
  }
});

/* -- image upload --*/


servicesModule.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
  function sendHttp(config) {
    config.method = config.method || 'POST';
    config.headers = config.headers || {};
    config.transformRequest = config.transformRequest || function(data, headersGetter) {
      if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
        return data;
      }
      return $http.defaults.transformRequest[0](data, headersGetter);
    };
    var deferred = $q.defer();

    if (window.XMLHttpRequest.__isShim) {
      config.headers['__setXHR_'] = function() {
        return function(xhr) {
          if (!xhr) return;
          config.__XHR = xhr;
          config.xhrFn && config.xhrFn(xhr);
          xhr.upload.addEventListener('progress', function(e) {
            deferred.notify(e);
          }, false);
          //fix for firefox not firing upload progress end, also IE8-9
          xhr.upload.addEventListener('load', function(e) {
            if (e.lengthComputable) {
              deferred.notify(e);
            }
          }, false);
        };
      };
    }

    $http(config).then(function(r){deferred.resolve(r)}, function(e){deferred.reject(e)}, function(n){deferred.notify(n)});

    var promise = deferred.promise;
    promise.success = function(fn) {
      promise.then(function(response) {
        fn(response.data, response.status, response.headers, config);
      });
      return promise;
    };

    promise.error = function(fn) {
      promise.then(null, function(response) {
        fn(response.data, response.status, response.headers, config);
      });
      return promise;
    };

    promise.progress = function(fn) {
      promise.then(null, null, function(update) {
        fn(update);
      });
      return promise;
    };
    promise.abort = function() {
      if (config.__XHR) {
        $timeout(function() {
          config.__XHR.abort();
        });
      }
      return promise;
    };
    promise.xhr = function(fn) {
      config.xhrFn = (function(origXhrFn) {
        return function() {
          origXhrFn && origXhrFn.apply(promise, arguments);
          fn.apply(promise, arguments);
        }
      })(config.xhrFn);
      return promise;
    };

    return promise;
  }

  this.upload = function(config) {
    config.headers = config.headers || {};
    config.headers['Content-Type'] = undefined;
    config.transformRequest = config.transformRequest || $http.defaults.transformRequest;
    var formData = new FormData();
    var origTransformRequest = config.transformRequest;
    var origData = config.data;
    config.transformRequest = function(formData, headerGetter) {
      if (origData) {
        if (config.formDataAppender) {
          for (var key in origData) {
            var val = origData[key];
            config.formDataAppender(formData, key, val);
          }
        } else {
          for (var key in origData) {
            var val = origData[key];
            if (typeof origTransformRequest == 'function') {
              val = origTransformRequest(val, headerGetter);
            } else {
              for (var i = 0; i < origTransformRequest.length; i++) {
                var transformFn = origTransformRequest[i];
                if (typeof transformFn == 'function') {
                  val = transformFn(val, headerGetter);
                }
              }
            }
            formData.append(key, val);
          }
        }
      }

      if (config.file != null) {
        var fileFormName = config.fileFormDataName || 'file';

        if (Object.prototype.toString.call(config.file) === '[object Array]') {
          var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
          for (var i = 0; i < config.file.length; i++) {
            formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i],
                (config.fileName && config.fileName[i]) || config.file[i].name);
          }
        } else {
          formData.append(fileFormName, config.file, config.fileName || config.file.name);
        }
      }
      return formData;
    };

    config.data = formData;

    return sendHttp(config);
  };

  this.http = function(config) {
    return sendHttp(config);
  }
}]);