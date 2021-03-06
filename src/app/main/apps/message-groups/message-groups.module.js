(function ()
{
    'use strict';

    angular
        .module('app.message-groups',
            [
                // 3rd Party Dependencies
                'wipImageZoom',
                'datatables',
                'flow',
                'textAngular',
                'wipImageZoom'
                //'xeditable'
            ]
        )
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.message-groups', {
                abstract: true,
                url     : '/message-groups'
            })
            .state('app.message-groups.subscribe', {
                url      : '/subscribe',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/groups-subscribe/groups-subscribe.html',
                        controller : 'GroupsSubscribeController as vm'
                    }
                },
                bodyClass: 'message-groups'
            })
            
            .state('app.message-groups.messages', {
                url      : '/messages/:filter/:type',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/group-messages/group-messages.html',
                        controller : 'GroupsScheduleController as vm'
                    }
                },
                params   : {
                    type: null,
                    filter: "inbox"
                },
                bodyClass: 'message-groups'
            })
            .state('app.message-groups.groups-setup', {
                url      : '/groups-setup',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/groups-setup/groups-setup.html',
                        controller : 'GroupsSetupController as vm'
                    }
                },
                bodyClass: 'message-groups'
            })
            .state('app.message-groups.groups-setup.add', {
                url      : '/add',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/group-setup/group-setup.html',
                        controller : 'GroupSetupController as vm'
                    }
                },
                resolve: {
                    Group: function ()
                    {
                        return {};
                    }
                },
                bodyClass: 'message-groups'
            })
            .state('app.message-groups.groups-setup.detail', {
                url      : '/:id',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/group-setup/group-setup.html',
                        controller : 'GroupSetupController as vm'
                    }
                },
                resolve  : {
                    Group: function ($stateParams, resource_service)
                    {
                        return resource_service.getDetails("groups", { id: $stateParams.id });
                    }
                },
                bodyClass: 'message-groups'
            });


        // Translation
        //$translatePartialLoaderProvider.addPart('app/main/apps/message-groups');



    }
})();