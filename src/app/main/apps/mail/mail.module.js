(function ()
{
    'use strict';

    angular
        .module('app.mail',
            [
                // 3rd Party Dependencies
                'textAngular'
            ]
        )
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.mail', {
                abstract: true,
                url     : '/mail',
            })
            .state('app.mail.threads', {
                url      : '/{type:(?:label)}/:filter',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/mail/mail.html',
                        controller : 'MailController as vm'
                    }
                },
                params   : {
                    type: {
                        value : null,
                        squash: true
                    }
                },
                bodyClass: 'mail'
            })
            .state('app.mail.threads.thread', {
                url      : '/:threadId',
                bodyClass: 'mail'
            });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/mail');



    }
})();