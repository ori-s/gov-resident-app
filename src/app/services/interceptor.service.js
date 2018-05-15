(function () {
    'use strict';

    var app = angular.module('app.core');
    app.config(function ($provide, $httpProvider) {
        return $httpProvider.interceptors.push('appHttpInterceptor');
    });


    app.factory("appHttpInterceptor", ["$q", "$log", "$injector", "$timeout", function ($q, $log, $injector, $timeout, $window) {
        return {
            request: function (config) {

                if (config.url.indexOf(_HTTPURL) == 0) {
                    if (window.sessionStorage.sessionToken) {
                        config.url += "&token=" + window.sessionStorage.sessionToken;
                    }
                }

                return config;
            },
            requestError: function (rejection) {
                if (canRecover(rejection)) {
                    return responseOrNewPromise
                }
                return $q.reject(rejection);
            },
            response: function (response) {
                $log.debug("success with status " + response.status);



                return response || $q.when(response);
            },
            responseError: function (rejection) {
                var message = angular.isObject(rejection.data) ? rejection.data.message : rejection.message;
                if (!rejection.data) {
                    rejection.data = {};
                }
                $log.debug("error with status " + rejection.status + " and data: " + message);
                switch (rejection.status) {
                    case 403:
                        console.error("You don't have the right to do this");
                        break;
                    case 401:
                        var AuthService = $injector.get('AuthService')
                        AuthService.logout(false, message);
                        break;
                    case 0:
                        console.error("No connection, internet is down?");
                        break;
                    default:
                        console.error("" + message);
                }
                return $q.reject(rejection);
            }
        };
    }]);



}());