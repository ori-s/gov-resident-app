(function ()
{
    'use strict';

    angular
        .module('app.account')
        .controller('AccountController', AccountController);


    /** @ngInject */
    function AccountController($scope, $state, blockUI, resource_service, Account, msUtils)
    {
        var vm = this;
        vm.account = Account;

        vm.saveAccount = function(form){
            if (form.$valid){
                resource_service.save('account', vm.account).then(function(ret){
                    msUtils.showSimpleToast("Upadate Successfully");
                });
            }
        }

    }
})();