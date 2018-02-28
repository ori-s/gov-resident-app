(function ()
{
    'use strict';

    angular
        .module('app.home',['angularMoment'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.home', {
            url      : '/gome',
            views    : {
                'content@app': {
                    templateUrl: 'app/main/apps/home/home.html',
                    controller : 'HomeController as vm'
                }
            },
            bodyClass: 'app_home'
        });
        // Navigation

        msNavigationServiceProvider.saveItem('apps', {
            title : 'APPS',
            translate: "APPS",
            group : true,
            weight: 1
        });

        msNavigationServiceProvider.saveItem('apps.home', {
            title : 'Home',
            icon  : 'icon-home',
            state : 'app.home',
            translate: 'Home',
            weight: 1
        });
    }

})();