(function ()
{
    'use strict';

    angular
        .module('app')
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider, $locationProvider, $translatePartialLoaderProvider)
    {
        //$locationProvider.html5Mode(true);
        $translatePartialLoaderProvider.addPart('app');
        $urlRouterProvider.otherwise('/auth/login');

        /**
         * Layout Style Switcher
         *
         * This code is here for demonstration purposes.
         * If you don't need to switch between the layout
         * styles like in the demo, you can set one manually by
         * typing the template urls into the `State definitions`
         * area and remove this code
         */
        // Inject $cookies
        var $cookies;

        angular.injector(['ngCookies']).invoke([
            '$cookies', function (_$cookies)
            {
                $cookies = _$cookies;
            }
        ]);

        var layouts = {
            verticalNavigation  : {
                main      : 'app/core/layouts/vertical-navigation.html',
                toolbar   : 'app/toolbar/layouts/vertical-navigation/toolbar.html',
                navigation: 'app/navigation/layouts/vertical-navigation/navigation.html'
            },
            contentOnly         : {
                main      : 'app/core/layouts/content-only.html',
                toolbar   : '',
                navigation: ''
            },
            contentWithToolbar  : {
                main      : 'app/core/layouts/content-with-toolbar.html',
                toolbar   : 'app/toolbar/layouts/content-with-toolbar/toolbar.html',
                navigation: ''
            },
            contentWithVerticalNavigation  : {
                main      : 'app/core/layouts/content-with-vertical-vavigation.html',
                toolbar   : '',
                navigation: 'app/navigation/layouts/vertical-navigation/navigation.html'
            },
        };

        var _layoutStyle = layouts.verticalNavigation;
        
        // State definitions
        $stateProvider
            .state('app', {
                abstract: true,
                views   : {
                    'main@'         : {
                        templateUrl: _layoutStyle.main,
                        controller : 'MainController as vm'
                    },
                    'toolbar@app'   : {
                        templateUrl: _layoutStyle.toolbar,
                        controller : 'ToolbarController as vm'
                    },
                    'navigation@app': {
                        templateUrl: _layoutStyle.navigation,
                        controller : 'NavigationController as vm'
                    }
                }
            });
    }

})();
