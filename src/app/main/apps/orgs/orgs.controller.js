(function ()
{
    'use strict';

    angular
        .module('app.orgs')
        .controller('OrgsController', OrgsController);

    /** @ngInject */
    function OrgsController($document, $mdSidenav, $q, data_service, authorization_service, $state)
    {
        var vm = this;
        vm.loading = true;

        vm.init = function () {
            data_service.get('/Organizations').then(function (ret) {
                //if (ret && ret.length == 1) vm.selectOrganization(null, ret[0]);
                vm.orgs = ret || [];
            }).finally(function () {
                vm.loading = false;
            });
        };

        vm.selectOrganization = function (e, organization) {
            authorization_service.setOrganization(organization).then(function () {
                $state.go('app.deliveries');
            }).catch();
        };

        // Data

        // Tasks will be filtered against these models
        vm.orgFilters = {
            name   : '',
        };
        vm.orgFiltersDefaults = angular.copy(vm.orgFilters);
        
        vm.orgOrder = 'title';
        vm.orgOrderDescending = false;

        vm.msScrollOptions = {
            suppressScrollX: true
        };

        // Methods
        vm.preventDefault = preventDefault;
        vm.init();

        //////////


        /**
         * Prevent default
         *
         * @param e
         */
        function preventDefault(e)
        {
            e.preventDefault();
            e.stopPropagation();
        }


    }
})();