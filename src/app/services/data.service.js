﻿(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('data_service', data_service);

    function data_service($state, $http, $q, $filter, blockUI, $translate, meta_service, msUtils, $mdToast, $mdDialog) {
        var service = {};
        // --------------------------------------------------------------------------------------->
        // http
        // --------------------------------------------------------------------------------------->

        service.getGEURL = function (what, act) {
            return _HTTPURL + "?Action=generalEntity&ET=" + what + "&ACT=" + act;
        };

        service.getURL = function (args) {
            var deferred = $q.defer();
            if (!args) args = {};
            if (!args.url) args.url = _HTTPURL + "/" + what;
            if (!args.hideLoading) blockUI.start();
            $http.get(args.url).then(function (data) {
                data = data.data;
                if (args.mapEnum) meta_service.mapEnum(data);
                if (!args.hideLoading) blockUI.stop();
                if (args.mapList) meta_service.mapEnum(data);
                if (args.prepare) args.prepare(data);
                if (args.cache) meta_service[args.cache] = data;
                if (args.setEnum) meta_service[args.type] = data;
                deferred.resolve(data);
            }).catch(function (msg, code) {
                if (!args.hideLoading) blockUI.stop();
                deferred.reject(msg);
            });
            return deferred.promise;
        }

        service.post = function (what, data, args) {
            if (!data) data = {};
            if (!args) args = {};
            if (!args.url) args.url = _HTTPURL + "?Action=" + what;
            if (!args.hideLoading) blockUI.start();
            return $http.post(args.url, data).then(function (data) {
                data = data.data;
                processHTTPResponse(data, args);
                return data;
            }).catch(function (msg, code) {
                throw(msg)
            }).finally(function(){
                if (!args.hideLoading) blockUI.stop();
            });
        }

        service.get = function (what, data, args) {
            if (!data) data = {};
            if (!args) args = {};
            if (!args.url) args.url = _HTTPURL + "?Action=" + what;
            if (!args.hideLoading) blockUI.start();
            return $http.get(args.url, {params:data}).then(function (data) {
                data = data.data;
                processHTTPResponse(data, args);
                return data;
            }).catch(function (msg, code) {
                throw(msg);
            }).finally(function(){
                if (!args.hideLoading) blockUI.stop();
            });
        }

        service.getRows = function (what, data, args) {
            var deferred = $q.defer();
            if (!data) data = {};
            if (!args) args = {};
            if (!args.url) args.url = service.getGEURL(what, "rows");
            if (!args.hideLoading) blockUI.start();
            return $http.post(args.url, data).then(function (data) {
                data = data.data;
                processHTTPResponse(data, args);
                return (data);
            }).catch(function (msg, code) {
                throw(msg)
            }).finally(function(){
                if (!args.hideLoading) blockUI.stop();
            });

        }

        service.getDetails = function (what, data, args) {
            var deferred = $q.defer();
            if (!data) data = {};
            if (!args) args = {};
            if (!args.url) args.url = service.getGEURL(what, "details");
            if (!args.hideLoading) blockUI.start();
            $http.post(args.url, data).then(function (data) {
                data = data.data;
                deferred.resolve(data);
            }).catch(function (msg, code) {
                deferred.reject(msg);
            }).finally(function(){
                if (!args.hideLoading) blockUI.stop();
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
                if (args.cache) meta_service[args.cache] = data;
                if (args.notify) {
                    msUtils.showSimpleToast(args.notifyText || $translate.instant("Saved Successfully"));
                };
                deferred.resolve(data);
            }).catch(function (msg, code) {
                if (!args.hideLoading) blockUI.stop();
                deferred.reject(msg);
            });
            return deferred.promise;
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
                }).catch(function () {
                    deferred.reject();
                });
            } else {
                delete_continue();
            }
            return deferred.promise;

            function delete_continue() {
                if (!args.url) {
                    args.url = service.getGEURL(what, "delete");
                }
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

            service.confirm = function (confirmText, ev) {

            }

            function fixDeleteCache() {
                if (args.cache) {
                    try {
                        _.remove(meta_service[args.cache], { id: data.id });
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

        function processHTTPResponse(data, args){
            if (args.mapEnum) meta_service.mapEnum(data);
            if (args.mapList) meta_service.mapEnum(data);
            if (args.prepare) args.prepare(data);
            if (args.cache) meta_service[args.cache] = data;
            if (args.setEnum) meta_service[what] = data;
        }

        return service;
    }


}());