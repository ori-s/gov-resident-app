(function ()
{
    'use strict';

    angular
        .module('app.account',[])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider)
    {
        // State
        $stateProvider.state('app.account', {
            url      : '/account',
            views    : {
                'content@app': {
                    templateUrl: 'app/main/apps/account/account.html',
                    controller : 'AccountController as vm'
                }
            },
            bodyClass: 'app_home'
        });
        // Navigation

    }

})();