(function ()
{
    'use strict';

    angular
        .module('app.message-groups')
        .controller('SubscriberDialogController', SubscriberDialogController);

    /** @ngInject */
    function SubscriberDialogController($scope, $mdDialog, $mdToast, $translate, Contact, Group, Subscribers, msUtils, data_service)
    {
        var vm = this;

        // Data
        vm.title = 'Edit Subscriber';
        vm.contact = angular.copy(Contact);
        //vm.contacts = Contacts;
        //vm.user = User;
        vm.newContact = false;
        vm.allFields = false;

        if ( !vm.contact )
        {
            vm.contact = {
                
            };

            vm.title = 'New Subscriber';
            vm.newContact = true;
            vm.contact.tags = [];
        }

        // Methods
        vm.addNewContact = addNewContact;
        vm.saveContact = saveContact;
        vm.deleteContact = deleteContact;
        vm.closeDialog = closeDialog;
        vm.toggleInArray = msUtils.toggleInArray;
        vm.exists = msUtils.exists;

        //////////

        /**
         * Add new contact
         */
        function addNewContact()
        {
            //vm.contacts.unshift(vm.contact);

            closeDialog();
        }

        /**
         * Save contact
         */
        function saveContact()
        {
            if ($scope.contactForm.$valid){
                
                data_service.save("group_subscribers", vm.contact, {notify:true, confirm:{}}).then(function (ret) {
                    closeDialog();
                    if (vm.newContact){
                        Subscribers.unshift(ret);
                    }else{
                        var index = _.findIndex(Subscribers, {id:vm.contact.id});
                        if (index >= 0) Subscribers[index] = ret;
                    }

                    closeDialog();
                });                
            }            
        }

        /**
         * Delete Contact Confirm Dialog
         */
        function deleteContact(ev)
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