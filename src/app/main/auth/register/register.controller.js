(function ()
{
    'use strict';

    angular
        .module('app.auth')
        .controller('RegisterController', RegisterController);

    /** @ngInject */
    function RegisterController($state, authorization_service)
    {
        var vm = this;
        vm.credentials = {};

        vm.apply = function () {
            vm.authError = null;
            authorization_service.register(vm.credentials).then(
               function (obj) {
                   $state.go("app.auth_login");    
               }).catch(function (error) {
                    var err = _.get(error, "message", "LOGIN.ERRORS.INVALID_CREDENTIALS");
                    vm.authError = { message: err };
               });
        };
    }
})();