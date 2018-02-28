(function () {
    'use strict';

    var app = angular.module('app.core');

    app.factory('authorization_service', function ($state, $http, $q, blockUI, $window, data_service, $sessionStorage) {
        var _HTTPTokenName = "tracknow-token";
        var service = {
            homeState: 'app.orgs',
            isLoggedIn: false,//for simulation purposes
            user: null,
            loginMessage: null,
            toState: null,
            toParams: null,
            onUserGet: null
        };

        service.logOut = function (message) {
            service.isLoggedIn = false;
            service.loginMessage = message;
            $sessionStorage.userToken = null;
        };

        service.login = function (credentials) {
            var deferred = $q.defer();
            blockUI.start();

            data_service.post('/oauth2/token', {
                grant_type: 'password',
                client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                username: credentials.email,
                password: credentials.password
            }).then(function (data) {
                handleLoginSuccess(data);
            }).catch(function (msg, code) {
                handleLoginFail(msg);
            }).finally(function (msg, code) {
                blockUI.stop();
            });

            return deferred.promise;

            function handleLoginSuccess(data) {
                service.isLoggedIn = true;
                //$cookieStore.put(_HTTPTokenName, data.token);
                $sessionStorage.userToken = data.access_token;
                deferred.resolve(service);
            };
            function handleLoginFail(err) {
                deferred.reject(err);
            };
        };

        service.isAuthenticated = function () {
            if ($sessionStorage.userToken) {
                service.organization = $sessionStorage.current_organization;

                service.loginMessage = false;
                if (!service.user) {
                    service.getUserInfo(true);
                }
                service.user = $sessionStorage.current_user;
                return true;
            } else {
                service.loginMessage = "Please login!";
                return false;
            }
        };
        service.getUserInfo = function () {
            return data_service.get('/account/me').then(function (data) {
                var arr = [];
                if (data.firstName) arr.push(data.firstName);
                if (data.lastName) arr.push(data.lastName);
                data.name = arr.join(" ");
                $sessionStorage.current_user = data;
                service.user = data;

                return data;
            }).catch(function (err) {
                service.logOut(null, err);
                return err;
            });
        };

        service.setOrganization = function (_organization) {
            return data_service.post('/Organizations/' + _organization.id + '/change', {})
              .then(function (organization) {
                  $sessionStorage.current_organization = organization;
                  service.organization = organization;
                  return organization;
              });
        };
        

        service.resetPassword = function (user) {
            var deferred = $q.defer();
            $http.get('api/resetpass.json', user)
              .then(function (data) {
                  deferred.resolve(data.data);
              }).catch(function (msg, code) {
                  msg = msg.message;
                  service.loginMessage = msg;
                  deferred.reject(msg);
              });
            return deferred.promise;
        }
        return service;
    });


    app.factory('meta_service', function ($state, $http, $q, $filter, $translate) {
        return {};
    });

    app.factory('data_service',
      function ($http, $q, ENV) {
          var service = {};

          service.find = function () {
              var deferred = $q.defer();
              if (ENV.forceEndpoint) {
                  deferred.resolve(ENV.apiEndpoint);
              } else {
                  if (service.endpoint) {
                      deferred.resolve(service.endpoint);
                  }
                  else {
                      $http.get('/api')
                          .then(function (result) {
                              service.endpoint = result.data;
                              deferred.resolve(service.endpoint);
                          }, function (err) {
                              deferred.reject(err);
                              console.log("Missing API EndPoint")
                          });
                  }
              }
              return deferred.promise;
          };

          service.get = function (endpoint, params) {
              var deferred = $q.defer();
              service.find()
                  .then(function (api) {
                      $http.get(api + endpoint, params)
                          .then(function (result) {
                              deferred.resolve(result.data);
                          }, function (err) {
                              deferred.reject(err);
                          });
                  });
              return deferred.promise;
          };

          service.getURL = function (endpoint, params) {
              var deferred = $q.defer();
              return $http.get(endpoint, params)
                  .then(function (result) {
                      return result.data;
                  }).catch(function (err) {
                      return err;
                  });
          };

          service.post = function (endpoint, data) {
              var deferred = $q.defer();
              service.find()
                  .then(function (api) {
                      $http.post(api + endpoint, data)
                          .then(function (result) {
                              deferred.resolve(result.data);
                          }, function (err) {
                              deferred.reject(err);
                          });
                  });
              return deferred.promise;
          };

          service.put = function (endpoint, data) {
              var deferred = $q.defer();
              service.find()
                  .then(function (api) {
                      $http.put(api + endpoint, data)
                          .then(function (result) {
                              deferred.resolve(result);
                          }, function (err) {
                              deferred.reject(err);
                          });
                  });
              return deferred.promise;
          };

          service.delete = function (endpoint) {
              var deferred = $q.defer();
              service.find()
                  .then(function (api) {
                      $http.delete(api + endpoint)
                          .then(function (result) {
                              deferred.resolve(result);
                          }, function (err) {
                              deferred.reject(err);
                          });
                  });
              return deferred.promise;
          };

          service.request = function (request) {
              var deferred = $q.defer();
              service.find()
                  .then(function (api) {
                      request.url = api + request.url;
                      $http(request)
                          .then(function (result) {
                              deferred.resolve(result);
                          }, function (err) {
                              deferred.reject(err);
                          });
                  });
              return deferred.promise;
          };
          return service;
      }
    );

    app.config(['$httpProvider',
        function ($httpProvider) {
            $httpProvider.interceptors.push('TokenInterceptor');
        }
    ]);

    app.factory('TokenInterceptor', 
      function ($q, $log, $rootScope, $window, $injector, $sessionStorage) {
          return {
              request: function (config) {
                  config.headers = config.headers || {};
                  if ($sessionStorage.userToken) {
                      config.headers.Authorization = 'Bearer ' + $sessionStorage.userToken;
                  }
                  return config;
              },
              responseError: function (response) {
                  var message = angular.isObject(response.data) ? response.data.message : response.message;
                  $log.debug("error with status " + response.status + " and data: " + message);
                  switch (response.status) {
                      case 403:
                          console.error("You don't have the right to do this");
                          break;
                      case 0:
                          console.error("No connection, internet is down?");
                          break;
                      default:
                          console.error(response);
                  }

                  var $state = $injector.get('$state');
                  if (response.status === 401) {

                      $rootScope.isLoggedIn = false;
                      $state.transitionTo("app.auth_login");

                      return $q.reject(response);
                  }

                  else if (response.status === 0) {
                      var ServerApi = $injector.get('ServerApi');
                      var i = $window.sessionStorage.length;
                      while (i--) {
                          var key = $window.sessionStorage.key(i);
                          $window.sessionStorage.removeItem(key);
                      }
                      ServerApi.endpoint = null;
                      $state.transitionTo("app.auth_login");
                      

                      return $q.reject(response);
                  }
                  return $q.reject(response);
              }
          };
      });




}());