(function ()
{
    'use strict';

    angular
        .module('app.message-groups')
        .controller('GroupDialogController', GroupDialogController);

    /** @ngInject */
    function GroupDialogController($scope, $mdDialog, $mdToast, $translate, Group, msUtils, message_service)
    {
        var vm = this;

        // Data
        vm.title = Group.subscribed ? 'Manage Subscription' : 'Subscribe to group';
        vm.group = angular.copy(Group);
        vm.subscription = vm.group.subscription || {
            email: true,
            sms: true,
            calendar: true
        }

        vm.subscribed = vm.group.subscribed;

        // Methods
        vm.updateGroup = updateGroup;
        vm.cancelGroup = cancelGroup;
        vm.closeDialog = closeDialog;


        function updateGroup()
        {
            if ($scope.groupForm.$valid){
                message_service.setGroupSubscription(vm.group, vm.subscription).then(function (group) {
                    $mdDialog.hide(group);
                });       
            }            
        }

        function cancelGroup(ev)
        {
            message_service.setGroupSubscription(vm.group).then(function (group) {
                $mdDialog.hide(group);
            }); 
        }

        function closeDialog()
        {
            $mdDialog.hide();
        }

    }
})();