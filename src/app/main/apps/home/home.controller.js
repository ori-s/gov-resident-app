(function ()
{
    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);


    /** @ngInject */
    function HomeController($scope, $mdSidenav, $q, data_service, authorization_service, $state, blockUI, $mdMedia, $mdDialog)
    {
        var vm = this;
        vm.loading = true;
    }
})();