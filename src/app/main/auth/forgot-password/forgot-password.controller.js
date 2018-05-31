(function () {
    'use strict';

    angular
        .module('app.auth')
        .controller('ForgotPasswordController', ForgotPasswordController);

    /** @ngInject */
    function ForgotPasswordController($state, authorization_service, $mdDialog, $translate) {
        var vm = this;
        vm.credentials = {};

        vm.apply = function (ev) {
            vm.authError = null;
            authorization_service.resetPassword(vm.credentials).then(
               function (obj) {
                   $mdDialog.show(
                     $mdDialog.alert()
                       .title($translate.instant('FORGOTPASSWORD.TITLE'))
                       .textContent($translate.instant('FORGOTPASSWORD.SUCCESS_MESSAGE'))
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