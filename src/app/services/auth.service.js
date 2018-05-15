(function () {
    'use strict';


    angular
        .module('app.core')
        .factory('authorization_service', authorization_service);

    function authorization_service($state, $http, $q, blockUI, $window, $cookieStore, meta_service) {

        var service = {
            isLoggedIn: false,//for simulation purposes
            user: null,
            loginMessage: null,
            toState: null,
            toParams: null,
            onUserGet: null
        };

        service.logout = function (message) {
            service.isLoggedIn = true;
            service.loginMessage = message;
            $cookieStore.remove(_HTTPTokenName);
            $window.sessionStorage.removeItem("sessionToken");
            //$state.transitionTo("app.auth_login");
        };

        service.login = function (user) {
            var deferred = $q.defer();
            blockUI.start();

            $http.post(_HTTPURL + "?Action=login", user)
              .then(function (data) {
                  handleLoginSuccess(data.data);
              }).catch(function (msg, code) {
                  handleLoginFail(msg);
              });
            return deferred.promise;

            function handleLoginSuccess(data) {
                blockUI.stop();
                service.isLoggedIn = true;
                $cookieStore.put(_HTTPTokenName, data.token);
                $window.sessionStorage.setItem("sessionToken", data.token);
                service.user = data;
                deferred.resolve(service);
            };
            function handleLoginFail(msg) {
                blockUI.stop();
                msg = msg.message;
                service.loginMessage = msg;
                deferred.reject(msg);
            };
        };

        service.isAuthenticated = function () {
            if ($window.sessionStorage.getItem("sessionToken")) {
                service.loginMessage = false;
                if (!service.user) {
                    service.getUserInfo(true);
                }
                return true;
            } else {
                service.loginMessage = "Please login!";
                return false;
            }
        };
        service.getUserInfo = function (getMetaData) {
            $http.post(_HTTPURL + "?Action=userInfo")
                .then(function (data) {
                    service.user = data.data;
                    if (getMetaData) {
                        service.getMetaData().then(
                            function () {
                                if (service.onUserGet) service.onUserGet.call(null);
                            }
                        );
                    }
                }).catch(function (msg, code) {
                    service.logout(null, msg);
                }
            );
        };
        service.getMetaData = function () {
            var deferred = $q.defer();
            blockUI.start();

            $http.post(_HTTPURL + "?Action=appMeta", {})
                .then(function (data) {
                    data = data.data;
                    blockUI.stop();
                    $.each(data, function (key, value) {
                        meta_service[key] = value;
                    });

                    // fix access
                    var _access = {};
                    _.each(service.user.roles, function (o) {
                        _access[o] = true;
                    });
                    meta_service.access = _access;
                    // fix menu

                    _.remove(meta_service.menu, function (menu) {
                        if (noAccessMenu(menu)) return true;
                        else {
                            _.remove(menu.modules, function (module) {
                                if (noAccessMenu(module)) return true;
                                else {
                                    _.remove(menu.children, function (child) {
                                        return noAccessMenu(child);
                                    });
                                }
                            });
                        };
                        function noAccessMenu(o) {
                            if (o.access) {
                                return !meta_service.checkAccess(o.access);
                            }
                        };
                    });

                    _.each(meta_service.menu, function (menu) {


                    })


                    meta_service.wasLoaded = true;
                    deferred.resolve(data);
                })
                .catch(function (msg, code) {
                    blockUI.stop();
                    service.logout(null, msg);
                    //deferred.reject(msg);
                });
            return deferred.promise;
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
    }

}());