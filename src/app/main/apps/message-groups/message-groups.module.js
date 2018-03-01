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
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.message-groups', {
                abstract: true,
                url     : '/message-groups'
            })
            .state('app.message-groups.groups-setup', {
                url      : '/groups-setup',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/views/groups-setup/groups-setup.html',
                        controller : 'GroupsSetupController as vm'
                    }
                },
                resolve  : {
                    Groups: function (data_service)
                    {
                        return data_service.get('groups', {editable:true});
                    }
                },
                bodyClass: 'message-groups'
            })
            .state('app.message-groups.groups-setup.add', {
                url      : '/add',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/views/group-setup/group-setup.html',
                        controller : 'GroupSetupController as vm'
                    }
                },
                resolve: {
                    Group: function (data_service)
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
                        templateUrl: 'app/main/apps/message-groups/views/group-setup/group-setup.html',
                        controller : 'GroupSetupController as vm'
                    }
                },
                resolve  : {
                    Group: function ($stateParams, data_service)
                    {
                        return data_service.getDetails("groups", { id: $stateParams.id });
                    }
                },
                bodyClass: 'message-groups'
            });


        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/message-groups');

        // Api
        msApiProvider.register('message-groups.dashboard', ['app/data/message-groups/dashboard.json']);
        msApiProvider.register('message-groups.products', ['app/data/message-groups/products.json']);
        msApiProvider.register('message-groups.orders', ['app/data/message-groups/orders.json']);
        msApiProvider.register('message-groups.order-statuses', ['app/data/message-groups/order-statuses.json']);

        // Navigation
        msNavigationServiceProvider.saveItem('admin', {
            title : 'admin',
            group : true,
            weight: 1
        });

        //msNavigationServiceProvider.saveItem('apps.message-groups.dashboard', {
        //    title: 'Dashboard',
        //    state: 'app.message-groups.dashboard'
        //});

        msNavigationServiceProvider.saveItem('admin.groups-setup', {
            title: 'Message Groups',
            state: 'app.message-groups.groups-setup',
            icon  : 'icon-group',
        });

        //msNavigationServiceProvider.saveItem('apps.message-groups.orders', {
        //    title: 'Orders',
        //    state: 'app.message-groups.orders'
        //});
    }
})();