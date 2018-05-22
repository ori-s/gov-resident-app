(function () {
    'use strict';

    angular
        .module('app.resident', ['angularMoment'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {
        // State
        $stateProvider
            .state('app.resident', {
                abstract: true,
                url: '/resident'
            })
            .state('app.resident.education', {
                url: '/education',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/apps/_shared/under_construction/under_construction.html',
                        controller: 'ResidentController as vm'
                    }
                },
                bodyClass: 'app_resident'
            })
            .state('app.resident.arnona', {
                url: '/arnona',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/apps/_shared/under_construction/under_construction.html',
                        controller: 'ResidentController as vm'
                    }
                },
                bodyClass: 'app_resident'
            })
            .state('app.resident.wellfare', {
                url: '/wellfare',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/apps/_shared/under_construction/under_construction.html',
                        controller: 'ResidentController as vm'
                    }
                },
                bodyClass: 'app_resident'
            })
            .state('app.resident.106', {
                url: '/106',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/apps/_shared/under_construction/under_construction.html',
                        controller: 'ResidentController as vm'
                    }
                },
                bodyClass: 'app_resident'
            });
        // Navigation




    }

})();