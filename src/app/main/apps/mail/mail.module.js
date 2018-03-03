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


        msNavigationServiceProvider.saveItem('messages', {
            title : 'messages',
            translate: "Messages",
            group : true,
            weight: 1
        });

        // Navigation
        msNavigationServiceProvider.saveItem('messages.mail', {
            title      : 'Mail',
            translate  : 'Message Center',
            icon       : 'icon-email',
            state      : 'app.mail.threads',
            stateParams: {
                filter: 'inbox'
            },
            badge      : {
                content: 25,
                color  : '#F44336'
            },
            weight     : 1
        });
    }
})();