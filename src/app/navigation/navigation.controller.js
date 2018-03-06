(function ()
{
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($scope, $state, message_service, authorization_service , $mdSidenav, MetaService)
    {
        $scope.MS = MetaService;
        var sidenav = $mdSidenav('navigation');


        var vm = this;
        vm.MSS = message_service;
        message_service.init();

        vm.$state = $state;
        // Data
        vm.bodyEl = angular.element('body');
        vm.folded = false;
        vm.closeOnMobile = closeOnMobile;
        vm.goTo = goTo;
        vm.isStateActive = isStateActive
        vm.msScrollOptions = {
            suppressScrollX: true
        };

        // Methods
        vm.toggleMsNavigationFolded = toggleMsNavigationFolded;
        vm.goHome = goHome;

        //////////

        function isStateActive(node){
            if ($state.includes(node.state)){
                if (node.id == "messages" && $state.params.filter == 'scheduled')return false;
                if (node.id == "scheduledMessages" && $state.params.filter != 'scheduled')return false;
                return true;
            }
            return false;
        }

        function goTo(obj){
            $state.go(obj.state, obj.stateParams)
            closeOnMobile()
        }

        function closeOnMobile(){
            if (!sidenav.isLockedOpen()) sidenav.close();
        }

        function goHome(){
            $state.go('app.home');
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