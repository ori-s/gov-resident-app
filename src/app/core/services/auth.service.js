(function () {
    'use strict';

    var _HTTPTokenName = "gov-resident-token";
    var _HTTPURL = "http://localhost/govresident/handler_simulated.ashx";
    var _APPSimulated = true;

    var app = angular.module('app.core');

    app.factory('authorization_service', function ($state, $http, $q, blockUI, $window, $cookieStore, MetaService) {


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
                        MetaService[key] = value;
                    });

                    // fix access
                    var _access = {};
                    _.each(service.user.roles, function (o) {
                        _access[o] = true;
                    });
                    MetaService.access = _access;
                    // fix menu

                    _.remove(MetaService.menu, function (menu) {
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
                                return !MetaService.checkAccess(o.access);
                            }
                        };
                    });

                    _.each(MetaService.menu, function (menu) {


                    })


                    MetaService.wasLoaded = true;
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
    });

    app.factory('MetaService', function ($state, $http, $q, $filter, blockUI, $translate, uiLoad) {
        var service = {
            __SIMULATED: window._APPSimulated,
            wasLoaded: false,
            mapEnum: function (arr) {
                _.each(arr, function (o) { o.value = o.id, o.text = o.name })
            },
            dateOpts: {
                format: 'MMMM D, YY',
                opens: 'left',
                ranges: {
                    "This Month": [moment().date(1), moment()],
                    'Previous Month': [moment().date(0).date(1), moment().date(0)],
                    'Last Day': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()]
                }
            },
            dateInputFormats: ['d!/M!/yyyy'],

            defMapCenter: { "lat": 32.178195, "lng": 34.90761 },
            defMapZoom: 4,
            mapSearchLocalComponents: "country:IL|street_address",
            mapLanguage: "iw",
            load: function (args) { return uiLoad.load(args) }
        }

        service.checkAccess = function (key) {
            if (!key || key.length === 0) return true;
            if (_.isArray(key)) var arr = key;
            else var arr = key.split(",");
            for (var i = 0; i < arr.length; i++) {
                if (service.access[arr[i]]) return true;
            }
            return false;
        };

        // gis ------------------------------------------------------------>

        service.getDefaultMarker = function (o) {
            switch (o.priority) {
                case 'I': return 'img/markers/marker_orange.png';
                case 'U': return 'img/markers/marker_red.png';
                default: return 'img/markers/marker_blue.png';
            }
        };
        service.goToGeo = function (from, to) {
            if (!to) var sURL = "http://maps.google.com/?saddr=" + from;
            else var sURL = "http://maps.google.com/?saddr=" + from + "&daddr=" + to;
            window.open(sURL);
        };
        service.getAddresses = function (address) {
            var params = { address: address, sensor: false };
            var params = {
                address: address,
                sensor: false,
                components: service.mapSearchLocalComponents,
                language: service.mapLanguage
            }
            if (address.length) {
                return $http.get(
                    'https://maps.googleapis.com/maps/api/geocode/json',
                    { params: params }
                ).then(function (response) {

                    var addresses = [];
                    _.each(response.data.results, function (result) {
                        var address = { formatted_address: result.formatted_address, position: result.geometry.location }

                        _.each(result.address_components, function (comp) {
                            switch (comp.types[0]) {
                                case "street_number":
                                    address.house = comp.long_name;
                                    break;
                                case "route":
                                    address.street = comp.long_name;
                                    address.partial = true;
                                    break;
                                case "locality":
                                    address.city = comp.long_name;
                                    address.partial = true;
                                    break;
                            }
                        });
                        addresses.push(address);
                    })
                    return addresses;
                });
            }
        };


        return service;
    });


    app.factory('data_service', function ($state, $http, $q, $filter, blockUI, $translate, MetaService, $mdToast, $mdDialog) {
        var service = {};
        var _HTTPURL = "http://localhost/govresident/handler_simulated.ashx";
        // --------------------------------------------------------------------------------------->
        // http
        // --------------------------------------------------------------------------------------->

        service.getGEURL = function (what, act) {
            return _HTTPURL + "?Action=generalEntity&ET=" + what + "&ACT=" + act;
        };

        service.getStateEntities = function (what, data, args) {
            var deferred = $q.defer();
            var q = {};
            _.each(what, function (ent) {
                q[ent] = service.get(ent, data, angular.copy(args));
            });
            $q.all(q).then(function (ret) {
                deferred.resolve(ret);
                window.setTimeout(function () { $(window).trigger('resize'); }, 400);
            }).catch(function (err) {
                deferred.resolve();
                console.error(err);
                window.setTimeout(function () { $(window).trigger('resize'); }, 400);
            });
            return deferred.promise;
        };
        service.getURL = function (args) {
            var deferred = $q.defer();
            if (!args) args = {};
            if (!args.url) args.url = service.getGEURL(what, "rows");
            if (!args.hideLoading) blockUI.start();
            $http.get(args.url).then(function (data) {
                data = data.data;
                if (args.mapEnum) MetaService.mapEnum(data);
                if (!args.hideLoading) blockUI.stop();
                if (args.mapList) MetaService.mapEnum(data);
                if (args.prepare) args.prepare(data);
                if (args.cache) MetaService[args.cache] = data;
                if (args.setEnum) MetaService[what] = data;
                deferred.resolve(data);
            }).catch(function (msg, code) {
                if (!args.hideLoading) blockUI.stop();
                deferred.reject(msg);
            });
            return deferred.promise;
        }

        service.get = function (what, data, args) {
            var deferred = $q.defer();
            if (!data) data = {};
            if (!args) args = {};
            if (!args.url) args.url = service.getGEURL(what, "rows");
            args.httpdelay = 600;
            var httpdelay = args.httpdelay || 0;
            if (!args.hideLoading) blockUI.start();
            $http.post(args.url, data).then(function (data) {
                data = data.data;
                if (args.mapEnum) MetaService.mapEnum(data);
                if (!args.hideLoading) blockUI.stop();
                if (args.mapList) MetaService.mapEnum(data);
                if (args.prepare) args.prepare(data);
                if (args.cache) MetaService[args.cache] = data;
                if (args.setEnum) MetaService[what] = data;

                deferred.resolve(data);
            }).catch(function (msg, code) {
                if (!args.hideLoading) blockUI.stop();
                deferred.reject(msg);
            });
            return deferred.promise;
        }

        service.getDetails = function (what, data, args) {
            var deferred = $q.defer();
            if (!data) data = {};
            if (!args) args = {};
            if (!args.url) args.url = service.getGEURL(what, "details");

            var httpdelay = args.httpdelay || 0;
            if (!args.hideLoading) blockUI.start();
            $http.post(args.url, data).then(function (data) {
                data = data.data;
                if (!args.hideLoading) blockUI.stop();
                if (args.mapList) MetaService.mapEnum(data);
                if (args.prepare) args.prepare(data);
                if (args.cache) MetaService[args.cache] = data;
                deferred.resolve(data);
            }).catch(function (msg, code) {
                if (!args.hideLoading) blockUI.stop();
                deferred.reject(msg);
            });
            return deferred.promise;
        }

        service.save = function (what, data, args) {
            var deferred = $q.defer();
            if (!args) args = {};
            if (!args.url) args.url = service.getGEURL(what, "save");
            args.httpdelay = 300;
            if (!args.hideLoading) blockUI.start();


            $http.post(args.url, data).then(function (data) {
                if (data.data) data = data.data;
                if (!args.hideLoading) blockUI.stop();
                if (args.prepare) args.prepare(data);
                if (args.cache) MetaService[args.cache] = data;
                if (args.notify) {
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent($translate.instant(args.notifyText || "Saved Successfully"))
                    );
                };
                deferred.resolve(data);
            }).catch(function (msg, code) {
                if (!args.hideLoading) blockUI.stop();
                deferred.reject(msg);
            });
            return deferred.promise;
        }

        service.confirm = function (confirmText, ev) {

        }

        service.delete = function (what, data, args) {
            if (!args) args = {};
            var deferred = $q.defer();
            if (args.confirm) {

                var confirm = $mdDialog.confirm()
                    .title($translate.instant('Confirm' || args.confirm.title))
                    .htmlContent($translate.instant('Are you sure you want delete this record' || args.confirm.content))
                    .ariaLabel('delete')
                    .targetEvent(args.ev)
                    .ok($translate.instant('Yes'))
                    .cancel($translate.instant('No'));

                $mdDialog.show(confirm).then(function () {
                    delete_continue();
                    vm.contacts.splice(vm.contacts.indexOf(Contact), 1);

                }).catch(function () {
                    deferred.reject();
                });


            } else {
                delete_continue();
            }
            return deferred.promise;

            function delete_continue() {
                if (!args.url) args.url = service.getGEURL(what, "delete");
                if (!args.hideLoading) blockUI.start();
                if (args.simulated) {
                    window.setTimeout(function () {
                        if (!args.hideLoading) blockUI.stop();
                        if (args.cache) fixDeleteCache();
                        deferred.resolve(data);

                        if (args.notify) {
                            $mdToast.show(
                              $mdToast.simple()
                                .textContent($translate.instant(args.notifyText || "Deleted Successfully"))
                            );
                        };

                    }, 600);
                } else {
                    $http.post(args.url, data).then(function (data) {
                        if (!args.hideLoading) blockUI.stop();
                        if (args.cache) fixDeleteCache();
                        deferred.resolve(data);

                        if (args.notify) {
                            $mdToast.show(
                              $mdToast.simple()
                                .textContent($translate.instant(args.notifyText || "Deleted Successfully"))
                            );
                        };

                    }).catch(function (msg, code) {
                        if (!args.hideLoading) blockUI.stop();
                        deferred.reject(msg);
                    });
                }
            }

            function fixDeleteCache() {
                if (args.cache) {
                    try {
                        _.remove(MetaService[args.cache], { id: data.id });
                    } catch (e) { }
                }
                PDialog.success({
                    text: args.successText || $translate.instant("Deleted Successfully!"),
                }).then(function () {
                    deferred.resolve(true);
                });
            };
            return deferred.promise;
        }

        return service;
    });

    app.factory('PDialog', function ($q, $translate) {
        return {}
    });

    app.service('uiLoad', function ($document, $q, $timeout) {

        var loaded = [];
        var promise = false;
        var deferred = $q.defer();

        this.load = function (srcs) {
            srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
            var self = this;
            if (!promise) {
                promise = deferred.promise;
            }
            angular.forEach(srcs, function (src) {
                promise = promise.then(function () {
                    return src.indexOf('.css') >= 0 ? self.loadCSS(src) : self.loadScript(src);
                });
            });
            deferred.resolve();
            return promise;
        }
        this.loadScript = function (src) {
            if (loaded[src]) return loaded[src].promise;

            var deferred = $q.defer();
            var script = $document[0].createElement('script');
            script.src = src;
            script.onload = function (e) {
                $timeout(function () {
                    deferred.resolve(e);
                });
            };
            script.onerror = function (e) {
                $timeout(function () {
                    deferred.reject(e);
                });
            };
            $document[0].body.appendChild(script);
            loaded[src] = deferred;

            return deferred.promise;
        };
        this.loadCSS = function (href) {
            if (loaded[href]) return loaded[href].promise;

            var deferred = $q.defer();
            var style = $document[0].createElement('link');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            style.href = href;
            style.onload = function (e) {
                $timeout(function () {
                    deferred.resolve(e);
                });
            };
            style.onerror = function (e) {
                $timeout(function () {
                    deferred.reject(e);
                });
            };
            $document[0].head.appendChild(style);
            loaded[href] = deferred;

            return deferred.promise;
        };
    });

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