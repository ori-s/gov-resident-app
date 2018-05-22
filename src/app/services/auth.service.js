(function () {
    'use strict';


    angular
        .module('app.core')
        .factory('authorization_service', authorization_service);

    function authorization_service($state, $http, $q, blockUI, $window, $cookieStore, resource_service, meta_service) {

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
            blockUI.start();
            var resource = resource_service.resources.login;
            if (resource.simulated) {
                var promise = $http.get(resource.url)
            } else {
                var promise = $http.post(_HTTPURL + "/" + resource.type, user)
            }

            return promise.then(function (data) {
                data = data.data;
                service.isLoggedIn = true;
                //$cookieStore.put(_HTTPTokenName, data.token);
                $window.sessionStorage.setItem("sessionToken", data.token);
                service.user = data;
                return service;
            }).catch(function (err, code) {
                msg = err.message;
                service.loginMessage = msg;
                deferred.reject(err);
            }).finally(function () {
                blockUI.stop();
            });
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
            var resource = resource_service.resources.userInfo;
            if (resource.simulated) {
                var promise = $http.get(resource.url)
            } else {
                var promise = $http.post(_HTTPURL + resource.type, {})
            }
            promise.then(function (data) {
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
            var resource = resource_service.resources.meta;
            if (resource.simulated) {
                var promise = $http.get(resource.url)
            } else {
                var promise = $http.post(_HTTPURL + resource.type, {})
            }
            blockUI.start();
            return promise.then(function (data) {
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
                    meta_service.wasLoaded = true;
                return data;
            }).catch(function (msg, code) {
                service.logout(null, msg);
                //deferred.reject(msg);
            }).finally(function () {
                blockUI.stop();
            });
        };
        service.resetPassword = function (data) {
            var resource = resource_service.resources.resetPass;
            if (resource.simulated) {
                var promise = $http.get(resource.url)
            } else {
                var promise = $http.post(_HTTPURL + resource.type, user)
            }
            return promise.then(function (data) {
                return data.data
            }).catch(function (err, code) {
                msg = err.message;
                return $q.reject(err);
            });
        }
        service.register = function (data) {
            var resource = resource_service.resources.register;
            if (resource.simulated) {
                var promise = $http.get(resource.url)
            } else {
                var promise = $http.post(_HTTPURL + resource.type, user)
            }
            return promise.then(function (data) {
                return data.data
            }).catch(function (err, code) {
                msg = err.message;
                return $q.reject(err);
            });
        }


        return service;
    }

}());