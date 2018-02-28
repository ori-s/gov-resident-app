(function () {
    'use strict';

    angular
        .module('app.auth.login')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($state, $location, $window, authorization_service, data_service, $q, ENV) {//blockUI
        var vm = this;
        vm.isLoading = false;
        authorization_service.logout();

        vm.credentials = {
            email: '',
            password: ''
        };

        vm.signin = function () {
            vm.authError = null;
            authorization_service.login(vm.credentials).then(
               function (obj) {                   
                    authorization_service.getMetaData().then(
                            function () {
                                if (obj.toState) {
                                    $state.go(obj.toState, obj.toParams);
                                    obj.toState = null;
                                } else {
                                    $state.go("app.home");
                                }
                            }
                    )                   
               }).catch(function (error) {
                var err = _.get(error, "message", "LOGIN.ERRORS.INVALID_CREDENTIALS");
                vm.authError = { message: err };
                   vm.credentials = {
                       email: '',
                       password: ''
                   };
               });
        };
    }
})();