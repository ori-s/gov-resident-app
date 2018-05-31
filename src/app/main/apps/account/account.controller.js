(function () {
    'use strict';

    angular
        .module('app.account')
        .controller('AccountController', AccountController);


    /** @ngInject */
    function AccountController($scope, $state, blockUI, resource_service, Account, msUtils) {
        var vm = this;
        vm.account = Account;

        vm.saveAccount = function (form) {
            if (form.$valid) {
                resource_service.save('account', vm.account).then(function (ret) {
                    msUtils.showSimpleToast("Upadate Successfully");
                });
            }
        }

        vm.aploadImage = function () {
            $("#acc-image-input").off("change");
            $("#acc-image-input").on("change", function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                _readURL(this);
                function _readURL(input) {
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            $scope.$apply(function () {
                                vm.account.image = (e.target.result);
                            });
                        }
                        reader.readAsDataURL(input.files[0]);
                    }
                }
            });
            $("#acc-image-input").click();
        }
    }
})();