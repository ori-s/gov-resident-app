(function ()
{
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($scope, $state, authorization_service, $mdSidenav, MetaService)
    {
        $scope.MS = MetaService;
        var sidenav = $mdSidenav('navigation');


        var vm = this;
        vm.auth = authorization_service;
        
        vm.$state = $state;
        // Data
        vm.bodyEl = angular.element('body');
        vm.folded = false;
        vm.closeOnMobile = closeOnMobile;

        vm.msScrollOptions = {
            suppressScrollX: true
        };

        // Methods
        vm.toggleMsNavigationFolded = toggleMsNavigationFolded;
        vm.goHome = goHome;

        //////////

        function closeOnMobile(){
            if (!sidenav.isLockedOpen()) sidenav.close();
        }

        function goHome(){
            $state.go(authorization_service.homeState);
        }


        /**
         * Toggle folded status
         */
        function toggleMsNavigationFolded()
        {
            vm.folded = !vm.folded;
        }

        // Close the mobile menu on $stateChangeSuccess
        $scope.$on('$stateChangeSuccess', function ()
        {
            vm.bodyEl.removeClass('ms-navigation-horizontal-mobile-menu-active');
        });
    }

})();