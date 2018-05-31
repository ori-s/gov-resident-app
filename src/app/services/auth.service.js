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
            
            return resource_service.post("login", user).then(function (data) {
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
            resource_service.post("userInfo").then(function (data) {
                service.user = data;
                if (getMetaData) {
                    service.getMetaData().then(
                        function () {
                            if (service.onUserGet) service.onUserGet.call(null);
                        }
                    );
                }
            }).catch(function (msg, code) {
                service.logout(null, msg);
            });
        };

        service.getMetaData = function () {
            var deferred = $q.defer();

            return resource_service.post("meta").then(function (data) {
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
            return resource_service.post("resetPass", data).then(function (data) {
                return data;
            }).catch(function (err, code) {
                throw(err)
            });
        }
        service.register = function (data) {
            return resource_service.post("register", data).then(function (data) {
                return data;
            }).catch(function (err, code) {
                throw(err)
            });
        }


        return service;
    }

}());