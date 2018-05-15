(function ()
{
    'use strict';

    angular
        .module('app.message-groups')
        .controller('MessageDialogController', MessageDialogController);

    /** @ngInject */
    function MessageDialogController($scope, $mdDialog, $mdToast, $translate, Message, Group, Messages, msUtils, resource_service)
    {
        var vm = this;

        // Data
        vm.title = 'Edit Message';
        vm.message = angular.copy(Message);
        
        //vm.messages = Messages;
        //vm.user = User;
        vm.newMessage = false;
        vm.allFields = false;

        if ( !vm.message )
        {
            vm.message = {
                groupId: Group.id

            };

            vm.title = 'New Message';
            vm.newMessage = true;
            vm.message.tags = [];
        }else{
            if (vm.message.scheduleDate) vm.message.scheduleDate = new Date(vm.message.scheduleDate);
            if (vm.message.reminderDate) vm.message.reminderDate = new Date(vm.message.reminderDate);
        }

        // Methods
        vm.addNewMessage = addNewMessage;
        vm.saveMessage = saveMessage;
        vm.deleteMessage = deleteMessage;
        vm.closeDialog = closeDialog;
        vm.toggleInArray = msUtils.toggleInArray;
        vm.exists = msUtils.exists;

        //////////

        /**
         * Add new message
         */
        function addNewMessage()
        {
            //vm.messages.unshift(vm.message);

            closeDialog();
        }

        /**
         * Save message
         */
        function saveMessage()
        {
            if ($scope.messageForm.$valid){
                vm.message.group = {
                    "id": Group.id,
                    "name": Group.name,
                    "avatar": Group.avatar,
                    "category": Group.category
                }
                resource_service.save("group_messages", vm.message, {notify:true, confirm:{}}).then(function (ret) {
                    closeDialog();
                    if (vm.newMessage){
                        Messages.unshift(ret);
                    }else{
                        var index = _.findIndex(Messages, {id:vm.message.id});
                        if (index >= 0) Messages[index] = ret;
                    }

                    closeDialog();
                });                
            }            
        }

        /**
         * Delete Message Confirm Dialog
         */
        function deleteMessage(ev)
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