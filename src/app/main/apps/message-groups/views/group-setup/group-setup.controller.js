(function () {
    'use strict';

    angular
        .module('app.message-groups')
        .controller('GroupSetupController', GroupSetupController);


    /** @ngInject */
    function GroupSetupController($scope, $document, $state, $mdDialog, data_service, Group, msUtils, $translate) {
        var vm = this;
        vm.$scope = $scope;
        // Data
        vm.group = Group;
        vm.categoriesSelectFilter = '';
        vm.ngFlowOptions = {
            // You can configure the ngFlow from here
            /*target                   : 'api/media/image',
             chunkSize                : 15 * 1024 * 1024,
             maxChunkRetries          : 1,
             simultaneousUploads      : 1,
             testChunks               : false,
             progressCallbacksInterval: 1000*/
        };
        vm.ngFlow = {
            // ng-flow will be injected into here through its directive
            flow: {}
        };
        vm.dropping = false;
        vm.imageZoomOptions = {};

        // Methods
        vm.saveGroup = saveGroup;
        vm.gotoGroups = gotoGroups;
        vm.fileAdded = fileAdded;
        vm.upload = upload;
        vm.fileSuccess = fileSuccess;
        vm.isFormValid = isFormValid;
        vm.updateImageZoomOptions = updateImageZoomOptions;

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

            data_service.save("groups", vm.group, { notify: true, confirm: {} }).then(function (ret) {
                vm.group = ret;
            });
        }

        function gotoGroups() {
            $state.go('app.message-groups.groups-setup', null, { reload: true, notify: true });
        }


        /**
         * File added callback
         * Triggers when files added to the uploader
         *
         * @param file
         */
        function fileAdded(file) {
            // Prepare the temp file data for media list
            var uploadingFile = {
                id: file.uniqueIdentifier,
                file: file,
                type: 'uploading'
            };

            // Append it to the media list
            vm.group.image = [uploadingFile];
        }

        /**
         * Upload
         * Automatically triggers when files added to the uploader
         */
        function upload() {
            // Set headers
            vm.ngFlow.flow.opts.headers = {
                'X-Requested-With': 'XMLHttpRequest',
                //'X-XSRF-TOKEN'    : $cookies.get('XSRF-TOKEN')
            };

            vm.ngFlow.flow.upload();
        }

        /**
         * File upload success callback
         * Triggers when single upload completed
         *
         * @param file
         * @param message
         */
        function fileSuccess(file, message) {
            // Iterate through the media list, find the one we
            // are added as a temp and replace its data
            // Normally you would parse the message and extract
            // the uploaded file data from it
            angular.forEach(vm.group.images, function (media, index) {
                if (media.id === file.uniqueIdentifier) {
                    // Normally you would update the media item
                    // from database but we are cheating here!
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(media.file.file);
                    fileReader.onload = function (event) {
                        media.url = event.target.result;
                    };

                    // Update the image type so the overlay can go away
                    media.type = 'image';
                }
            });
        }

        /**
         * Checks if the given form valid
         *
         * @param formName
         */
        function isFormValid(formName) {
            if ($scope[formName] && $scope[formName].$valid) {
                return $scope[formName].$valid;
            }
        }

        /**
         * Update image zoom options
         *
         * @param url
         */
        function updateImageZoomOptions(url) {
            vm.imageZoomOptions = {
                images: [
                    {
                        thumb: url,
                        medium: url,
                        large: url
                    }
                ]
            };
        }

        //---------------------------------------------------------------->
        // subscribers
        //---------------------------------------------------------------->

        vm.subscribersOrder = 'firstName';
        vm.subscribersOrderAsc = false;

        function onSubscribersSelected() {
            if (!vm.subscribers) {
                vm.loadingSubscribers = true;
                data_service.get('group_subscribers', { group: vm.group.id }).then(function (ret) {
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
            data_service.delete("group_subscribers", subscriber, { notify: true, confirm: true }).then(function () {
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
                data_service.get('group_messages', { group: vm.group.id }).then(function (ret) {
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
            data_service.delete("group_messages", message, { notify: true, confirm: true }).then(function () {
                var index = _.findIndex(vm.messages, { id: message.id });
                if (index >= 0) vm.messages.splice(index, 1);
            }).catch(function (err) {
                console.error(err);
            });
        }
    }
})();

/*
var groups = [];
var messages = [];
var reffMessage = ret[0];
_.each($scope.MS.group_categories, function (category) {
    for (var i = 0; i < 3; i++) {
        var newGroup = angular.copy(vm.group);
        delete newGroup.images;
        delete newGroup.number;
        newGroup.category = category.id;
        newGroup.avatar = category.avatar;
        newGroup.name = category.name + " " + $translate.instant("Group") + " " + (i + 1);
        newGroup.id = category.id + "_" + i;
        newGroup.subscribers = 300 + Math.ceil(Math.random() * 1000);
        var _group = {
            id: newGroup.id,
            name: newGroup.name,
            avatar: category.avatar,
            category: newGroup.category
        }
        groups.push(newGroup);
        for (var j = 0; j < 5; j++) {
            var newMessage = angular.copy(reffMessage);
            newMessage.subject = newGroup.name + " " + $translate.instant("Message") + " " + (j + 1);
            newMessage.groupId = newGroup.id;
            newMessage.id = newGroup.id + "_" + j;
            newMessage.group = _group;
            if (j > 3) {
                newMessage.scheduled = true;
                newMessage.scheduleDate = moment().add(3, 'days').toDate();
                newMessage.reminderDate = moment().add(2, 'days').toDate();;
            }
            messages.push(newMessage);
        }
    }
});
console.log(JSON.stringify(groups));
console.log(JSON.stringify(messages));
*/
