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
            .state('app.message-groups.dashboard', {
                url      : '/dashboard',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/views/dashboard/dashboard.html',
                        controller : 'DashboardEcommerceController as vm'
                    }
                },
                resolve  : {
                    Dashboard: function (msApi)
                    {
                        return msApi.resolve('message-groups.dashboard@get');
                    }
                },
                bodyClass: 'ecommerce'
            })
            .state('app.message-groups.products', {
                url      : '/products',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/views/products/products.html',
                        controller : 'ProductsController as vm'
                    }
                },
                resolve  : {
                    Products: function (eCommerceService)
                    {
                        return eCommerceService.getProducts();
                    }
                },
                bodyClass: 'message-groups'
            })
            .state('app.message-groups.products.add', {
                url      : '/add',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/views/product/product.html',
                        controller : 'ProductController as vm'
                    }
                },
                resolve: {
                    Product: function (eCommerceService)
                    {
                        return eCommerceService.newProduct();
                    }
                },
                bodyClass: 'message-groups'
            })
            .state('app.message-groups.products.detail', {
                url      : '/:id',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/views/product/product.html',
                        controller : 'ProductController as vm'
                    }
                },
                resolve  : {
                    Product: function ($stateParams, Products, eCommerceService)
                    {
                        return eCommerceService.getProduct($stateParams.id);
                    }
                },
                bodyClass: 'message-groups'
            })
            .state('app.message-groups.orders', {
                url      : '/orders',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/views/orders/orders.html',
                        controller : 'OrdersController as vm'
                    }
                },
                resolve  : {
                    Orders: function (eCommerceService)
                    {
                        return eCommerceService.getOrders();
                    }
                },
                bodyClass: 'message-groups'
            })
            .state('app.message-groups.orders.detail', {
                url      : '/:id',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/message-groups/views/order/order.html',
                        controller : 'OrderController as vm'
                    }
                },
                resolve  : {
                    Order        : function ($stateParams, Orders, eCommerceService)
                    {
                        return eCommerceService.getOrder($stateParams.id);
                    },
                    OrderStatuses: function (eCommerceService)
                    {
                        return eCommerceService.getOrderStatuses();
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
        msNavigationServiceProvider.saveItem('apps.message-groups', {
            title : 'E-Commerce',
            icon  : 'icon-cart',
            weight: 3
        });

        msNavigationServiceProvider.saveItem('apps.message-groups.dashboard', {
            title: 'Dashboard',
            state: 'app.message-groups.dashboard'
        });

        msNavigationServiceProvider.saveItem('apps.message-groups.products', {
            title: 'Products',
            state: 'app.message-groups.products'
        });

        msNavigationServiceProvider.saveItem('apps.message-groups.orders', {
            title: 'Orders',
            state: 'app.message-groups.orders'
        });
    }
})();