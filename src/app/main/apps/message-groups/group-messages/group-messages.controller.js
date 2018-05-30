(function ()
{
    'use strict';

    angular
        .module('app.message-groups')
        .controller('GroupsScheduleController', GroupsScheduleController);

    /** @ngInject */
    function GroupsScheduleController($rootScope,$mdSidenav, $q, resource_service, message_service, $state, $mdDialog)
    {
        var vm = this;
        vm.loading = true;
        vm.messageOrder = 'scheduleDate';
        vm.messageOrderDescending = false;
        vm.filterMessages = filterMessages;
        vm.handleGroupSubscription = handleGroupSubscription;
        vm.toggleGroupScheduled = message_service.toggleGroupScheduled;
        vm.toggleSidenav = toggleSidenav;

        vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
        vm.views = [{
            icon: 'icon-view-list',
            name: 'List View',
            url: 'app/main/apps/message-groups/group-messages/blocks/card-view.html'  
        },{
            icon: 'icon-view-module',
            name: 'Card View',
            url: 'app/main/apps/message-groups/group-messages/blocks/list-view.html'  
        }]
        vm.view = vm.views[0];
        vm.toggleView = function(){
            vm.view = vm.view == vm.views[0] ? vm.views[1] : vm.views[0];
        }

        vm.preventDefault = preventDefault;
        vm.currentFilter = {
            filter: $state.params.filter || "inbox",
            type  : $state.params.type || null            
        };


        init();
        function init() {
            $q.all({
                groups:  message_service.getSubscribableGroups(),
                messages:  message_service.getMessages(vm.currentFilter)
            }).then(function (ret) {
                vm.groups = _.filter(ret.groups, function(g){return !g.subscribed});
                vm.group = _.find(vm.groups, {id:vm.currentFilter.type});

                vm.messages = ret.messages;
                vm.messageCount = vm.messages.length;
                _.each(vm.messages, function(message){
                    message.$$visible = true;
                })
            }).finally(function () {
                vm.loading = false;
            });
        };

        vm.selectCategory = function(group){
            var args = {
                filter: "inbox",
                type  : group.id
            };
            vm.group = group;
            $rootScope.loadingProgress = true;
            $state.go('app.message-groups.messages', args, {notify: false});
            message_service.getMessages(args).then(
                function (response)
                {
                    vm.messages = response;
                    filterMessages();
                    vm.currentFilter = args;
                }
            ).finally(function(){
                $rootScope.loadingProgress = false;
            });

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
                type  : group.id,
                filter: "inbox"
            });
        }

        function handleGroupSubscription(message, ev){
            message_service.handleGroupSubscription(vm.group, ev).then(function(ret){
                if (ret) vm.viewGroupMessages(vm.group);
            })
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