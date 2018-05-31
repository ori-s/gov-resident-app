(function ()
{
    'use strict';

    angular
        .module('app.account')
        .controller('AccountController', AccountController);


    /** @ngInject */
    function AccountController($scope, $state, blockUI, resource_service, Account)
    {
        var vm = this;
        vm.account = Account;

        function init(){
            
        }

    }
})();