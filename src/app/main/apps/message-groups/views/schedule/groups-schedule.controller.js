(function ()
{
    'use strict';

    angular
        .module('app.message-groups')
        .controller('GroupsScheduleController', GroupsScheduleController);

    /** @ngInject */
    function GroupsScheduleController($mdSidenav, $q, data_service, message_service, $state, $mdDialog)
    {
        var vm = this;
        vm.loading = true;
        vm.messageOrder = 'scheduleDate';
        vm.messageOrderDescending = false;
        vm.filterMessages = filterMessages;
        vm.toggleGroupScheduled = message_service.toggleGroupScheduled;
        vm.toggleSidenav = toggleSidenav;

        vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
        vm.views = [{
            icon: 'icon-view-list',
            name: 'List View',
            url: 'app/main/apps/message-groups/views/schedule/blocks/card-view.html'  
        },{
            icon: 'icon-view-module',
            name: 'Card View',
            url: 'app/main/apps/message-groups/views/schedule/blocks/list-view.html'  
        }]
        vm.view = vm.views[0];
        vm.toggleView = function(){
            vm.view = vm.view == vm.views[0] ? vm.views[1] : vm.views[0];
        }

        vm.preventDefault = preventDefault;

        init();
        function init() {
            $q.all({
                messages:  message_service.getScheduledMessages(),
            }).then(function (ret) {
                vm.messages = ret.messages;
                vm.messageCount = vm.messages.length;
                _.each(vm.messages, function(message){
                    message.$$visible = true;
                })
            }).finally(function () {
                vm.loading = false;
            });
        };

        vm.selectCategory = function(cat){
            vm.category = cat;
            filterMessages();
        }

        function filterMessages(){
            var NN=0, query = vm.search && vm.search.length && vm.search.toLowerCase(), category = vm.category && vm.category.id;
            _.each(vm.messages, function(message){
                message.$$visible = isGroupVisible(message)
            });
            vm.messageCount = NN;
            function isGroupVisible(message){
                if (category && message.group.category != category){
                    return false;
                }
                if (query){
                    if (message.subject.toLowerCase().indexOf(query) == -1 && message.message.toLowerCase().indexOf(query) == -1) return false;
                };
                ++NN;
                return true;
            }
        }

        vm.viewGroupMessages = function(group){
            $state.go('app.mail.threads', {
                type  : null,
                filter: group.id
            });
        }
        // ---------------------------------------------------------->


        function preventDefault(e)
        {
            e.preventDefault();
            e.stopPropagation();
        }

        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }


    }

})();