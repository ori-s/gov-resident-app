(function ()
{
    'use strict';

    angular
        .module('app.message-groups')
        .controller('SubscriberDialogController', SubscriberDialogController);

    /** @ngInject */
    function SubscriberDialogController($scope, $mdDialog, $mdToast, $translate, Subscriber, Group, Subscribers, msUtils, resource_service)
    {
        var vm = this;

        // Data
        vm.title = 'Edit Subscriber';
        vm.subscriber = angular.copy(Subscriber);
        //vm.subscribers = Subscribers;
        //vm.user = User;
        vm.newSubscriber = false;
        vm.allFields = false;

        if ( !vm.subscriber )
        {
            vm.subscriber = {
                groupId: Group.id
            };

            vm.title = 'New Subscriber';
            vm.newSubscriber = true;
            vm.subscriber.tags = [];
        }

        // Methods
        vm.addNewSubscriber = addNewSubscriber;
        vm.saveSubscriber = saveSubscriber;
        vm.deleteSubscriber = deleteSubscriber;
        vm.closeDialog = closeDialog;
        vm.toggleInArray = msUtils.toggleInArray;
        vm.exists = msUtils.exists;

        //////////

        /**
         * Add new subscriber
         */
        function addNewSubscriber()
        {
            //vm.subscribers.unshift(vm.subscriber);

            closeDialog();
        }

        /**
         * Save subscriber
         */
        function saveSubscriber()
        {
            if ($scope.subscriberForm.$valid){
                
                resource_service.save("group_subscribers", vm.subscriber, {notify:true, confirm:{}}).then(function (ret) {
                    closeDialog();
                    if (vm.newSubscriber){
                        Subscribers.unshift(ret);
                    }else{
                        var index = _.findIndex(Subscribers, {id:vm.subscriber.id});
                        if (index >= 0) Subscribers[index] = ret;
                    }

                    closeDialog();
                });                
            }            
        }

        /**
         * Delete Subscriber Confirm Dialog
         */
        function deleteSubscriber(ev)
        {
            $mdDialog.hide({mode:"delete"});
        }

        /**
         * Close dialog
         */
        function closeDialog()
        {
            $mdDialog.hide();
        }

    }
})();