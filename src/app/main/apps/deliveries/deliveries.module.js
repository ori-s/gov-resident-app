(function ()
{
    'use strict';

    angular
        .module('app.deliveries',['angularMoment', 'ui.event','ui.map','duScroll'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.deliveries', {
            url      : '/deliveries',
            views    : {
                'content@app': {
                    templateUrl: 'app/main/apps/deliveries/deliveries.html',
                    controller : 'DeliveriesController as vm'
                },
                'toolbar@app'   : {
                    templateUrl: 'app/main/apps/deliveries/toolbar/toolbar.html',
                    controller : 'ToolbarController as vm'
                }
            },
            resolve: {
                promise: function(){
                    return loadGoogleMaps(3, 'AIzaSyCFr2AdQh14mwe0SVy0EQKHrB5RRk4NTBU', 'iw').then(() => {
                        return true
                    });
                }            
            },
            bodyClass: 'deliveries'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/deliveries');


        // Navigation

        msNavigationServiceProvider.saveItem('apps', {
            title : 'APPS',
            translate: "APPS",
            group : true,
            weight: 1
        });

        msNavigationServiceProvider.saveItem('apps.deliveries', {
            title : 'Deliveries',
            icon  : 'icon-apps',
            state : 'app.deliveries',
            translate: 'TD.DELIVERIES',
            weight: 1
        });
    }

})();