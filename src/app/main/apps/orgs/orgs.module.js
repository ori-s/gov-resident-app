(function ()
{
    'use strict';

    angular
        .module('app.orgs',
            [
                // 3rd Party Dependencies
                'ng-sortable'
            ]
        )
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.orgs', {
            url      : '/orgs',
            views    : {
                'content@app': {
                    templateUrl: 'app/main/apps/orgs/orgs.html',
                    controller : 'OrgsController as vm'
                }
            },
            isOrganization: true,
            bodyClass: 'orgs'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/orgs');


        // Navigation

        msNavigationServiceProvider.saveItem('apps', {
            title : 'APPS',
            translate: 'APPS',
            group : true,
            weight: 1
        });

        msNavigationServiceProvider.saveItem('apps.orgs', {
            title : 'Organizations',
            icon  : 'icon-home-variant',
            state : 'app.orgs',
            translate: 'ORGS.ORGANIZATIONS',
            weight: 1
        });
    }

})();