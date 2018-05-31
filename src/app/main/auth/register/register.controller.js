(function ()
{
    'use strict';

    angular
        .module('app.auth')
        .controller('RegisterController', RegisterController);

    /** @ngInject */
    function RegisterController($state, authorization_service,$mdDialog, $translate)
    {
        var vm = this;
        vm.credentials = {};

        vm.apply = function (ev) {
            vm.authError = null;
            authorization_service.register(vm.credentials).then(
               function (obj) {
                   $mdDialog.show(
                     $mdDialog.alert()
                       .title($translate.instant('REGISTER.TITLE'))
                       .textContent($translate.instant('REGISTER.SUCCESS_MESSAGE'))
                       .ariaLabel('OK')
                       .ok('OK')
                       .targetEvent(ev)
                   ).finally(function () {
                       $state.go("app.auth_login");    
                   });
                   
               }).catch(function (error) {
                    var err = _.get(error, "message", "LOGIN.ERRORS.INVALID_CREDENTIALS");
                    vm.authError = { message: err };
               });
        };
    }
})();