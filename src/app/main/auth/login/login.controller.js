(function () {
    'use strict';

    angular
        .module('app.auth.login')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($state, $location, $window, authorization_service, data_service, $q, ENV) {//blockUI
        var vm = this;
        vm.isLoading = false;
        authorization_service.logOut();

        vm.credentials = {
            email: '',
            password: ''
        };

        vm.signin = function () {
            vm.authError = null;
            authorization_service.login(vm.credentials).then(function (obj) {
                $q.all({
                    orgs: data_service.get('/Organizations'),
                    userInfo: authorization_service.getUserInfo()
                }).then(
                    function (ret) {
                        if (ret.orgs.length  == 1){
                            authorization_service.isSingleOrg = true;
                            authorization_service.setOrganization(ret.orgs[0]).then(function () {
                                $state.go('app.deliveries');
                            }).catch(function(){
                                $state.go('app.orgs');
                            });
                        }else if (obj.toState) {
                            $state.go(obj.toState, obj.toParams);
                            obj.toState = null;
                        } else {
                            $state.go('app.orgs');
                        }
                    }
                ).catch();
            }).catch(function (error) {
                var err = _.get(err, "data.error_description", "LOGIN.ERRORS.INVALID_CREDENTIALS");
                vm.authError = {message:err};

                vm.credentials = {
                    email: '',
                    password: ''
                };

            });
        };

    }
})();