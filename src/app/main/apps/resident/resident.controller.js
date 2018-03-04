(function ()
{
    'use strict';

    angular
        .module('app.resident')
        .controller('ResidentController', ResidentController);


    /** @ngInject */
    function ResidentController($scope, $mdSidenav, $q, data_service, authorization_service, $state, blockUI, $mdMedia, $mdDialog)
    {
        var vm = this;
        vm.loading = true;
    }
})();