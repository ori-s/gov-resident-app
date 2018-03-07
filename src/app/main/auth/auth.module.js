(function ()
{
    'use strict';

    angular
        .module('app.auth', [
            'app.auth.login',
            'app.auth.forgot-password',
            'app.auth.register',
        ])
        .config(config);

    /** @ngInject */
    function config(msNavigationServiceProvider)
    {

        //msNavigationServiceProvider.saveItem('auth', {
        //    title : 'AUTH',
        //    group : true,
        //    weight: 1
        //});

    }
})();