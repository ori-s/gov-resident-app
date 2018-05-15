(function () {
	'use strict';

	angular
        .module('app.core')
        .factory('meta_service', meta_service)
        .factory('PDialog', PDialog)
        .factory('uiLoad', uiLoad);

	function meta_service($state, $http, $q, $filter, blockUI, $translate) {
		var service = {
			wasLoaded: false,
            defTostPosition:'bottom right',
			dateOpts: {
				format: 'MMMM D, YY',
				opens: 'left',//near
				ranges: {
					"This Month": [moment().date(1), moment()],
					'Previous Month': [moment().date(0).date(1), moment().date(0)],
					'Last Day': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
					'Last 7 Days': [moment().subtract(6, 'days'), moment()],
					'Last 30 Days': [moment().subtract(29, 'days'), moment()]
				}
			},
			dateInputFormats: ['d!/M!/yyyy'],
            drToday: moment().format('YYYY-MM-DD'),
			mapEnum: function (arr) {
				_.each(arr, function (o) { o.value = o.id, o.text = o.name })
			}
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

		return service;
	}

    function PDialog($q, $translate) {
        return {}
    }

    function uiLoad($document, $q, $timeout) {
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
    }


}());