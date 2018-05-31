(function () {
    'use strict';

    angular
        .module('app.message-groups')
        .controller('GroupSetupController', GroupSetupController);


    /** @ngInject */
    function GroupSetupController($scope, $document, $state, $mdDialog, resource_service, Group, msUtils, $translate) {
        var vm = this;
        vm.$scope = $scope;
        // Data
        vm.group = Group;
        vm.categoriesSelectFilter = '';

        // Methods
        vm.saveGroup = saveGroup;
        vm.gotoGroups = gotoGroups;
        vm.isFormValid = isFormValid;

        vm.subscribersSelected = onSubscribersSelected;
        vm.messagesSelected = onMessagesSelected;

        //////////

        init();

        /**
         * Initialize
         */
        function init() {
            vm.group = _.extend({
                images: [],
                tags: []
            }, vm.group);

            if (vm.group.images.length > 0) {
                vm.updateImageZoomOptions(vm.group.images[0].url);
            }
        }

        /**
         * Save group
         */
        function saveGroup() {

            resource_service.save("groups", vm.group, { notify: true, confirm: {} }).then(function (ret) {
                vm.group = ret;
            });
        }

        function gotoGroups() {
            $state.go('app.message-groups.groups-setup', null, { reload: true, notify: true });
        }

        function isFormValid(formName) {
            if ($scope[formName] && $scope[formName].$valid) {
                return $scope[formName].$valid;
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
                                vm.group.image = (e.target.result);
                            });
                        }
                        reader.readAsDataURL(input.files[0]);
                    }
                }
            });
            $("#acc-image-input").click();
        }


        //---------------------------------------------------------------->
        // subscribers
        //---------------------------------------------------------------->

        vm.subscribersOrder = 'firstName';
        vm.subscribersOrderAsc = false;

        function onSubscribersSelected() {
            if (!vm.subscribers) {
                vm.loadingSubscribers = true;
                resource_service.get('group_subscribers', { group: vm.group.id }).then(function (ret) {
                    vm.subscribers = ret || [];
                }).finally(function () {
                    vm.loadingSubscribers = false;
                })
            }
        }
        vm.openSubscriberDialog = function (ev, subscriber) {
            $mdDialog.show({
                controller: 'SubscriberDialogController',
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/message-groups/dialogs/subscriber/subscriber-dialog.html',
                //parent             : angular.element($document.find('#content-container')),
                targetEvent: ev,
                fullscreen: true,
                clickOutsideToClose: true,
                locals: {
                    Subscriber: subscriber,
                    Subscribers: vm.subscribers,
                    Group: vm.group
                }
            }).then(function (response) {
                if (response && response.mode == '"delete"') vm.deleteSubscriber(subscriber, ev);
            }, function () { });;
        }

        vm.deleteSubscriber = function (subscriber, ev) {
            resource_service.delete("group_subscribers", subscriber, { notify: true, confirm: true }).then(function () {
                var index = _.findIndex(vm.subscribers, { id: subscriber.id });
                if (index >= 0) vm.subscribers.splice(index, 1);
            }).catch();
        }


        //---------------------------------------------------------------->
        // messages
        //---------------------------------------------------------------->

        vm.messagesOrder = 'subject';
        vm.messagesOrderAsc = false;

        function onMessagesSelected() {
            if (!vm.messages) {
                vm.loadingMessages = true;
                resource_service.get('group_messages', { group: vm.group.id }).then(function (ret) {
                    ret = _.filter(ret, { "groupId": Group.id });
                    vm.messages = ret || [];
                }).finally(function () {
                    vm.loadingMessages = false;
                })
            }
        }
        vm.openMessageDialog = function (ev, message) {
            $mdDialog.show({
                controller: 'MessageDialogController',
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/message-groups/dialogs/message/message-dialog.html',
                //parent             : angular.element($document.find('#content-container')),
                targetEvent: ev,
                fullscreen: true,
                clickOutsideToClose: true,
                locals: {
                    Message: message,
                    Messages: vm.messages,
                    Group: vm.group
                }
            }).then(function (response) {
                if (response && response.mode == '"delete"') vm.deleteMessage(message, ev);
            }, function () { });;
        }

        vm.deleteMessage = function (message, ev) {
            resource_service.delete("group_messages", message, { notify: true, confirm: true }).then(function () {
                var index = _.findIndex(vm.messages, { id: message.id });
                if (index >= 0) vm.messages.splice(index, 1);
            }).catch(function (err) {
                console.error(err);
            });
        }
    }
})();

