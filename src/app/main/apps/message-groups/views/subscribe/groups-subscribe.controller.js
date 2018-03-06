(function ()
{
    'use strict';

    angular
        .module('app.message-groups')
        .controller('GroupsSubscribeController', GroupsSubscribeController);

    /** @ngInject */
    function GroupsSubscribeController($mdSidenav, $q, data_service, message_service, $state, $mdDialog)
    {
        var vm = this;
        vm.loading = true;
        vm.groupOrder = 'name';
        vm.groupOrderDescending = false;
        vm.filterGroups = filterGroups;
        vm.toggleGroupSubscribed = message_service.toggleGroupSubscribed;
        vm.toggleSidenav = toggleSidenav;

        vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
        vm.views = [{
            icon: 'icon-view-list',
            name: 'List View',
            url: 'app/main/apps/message-groups/views/subscribe/blocks/card-view.html'  
        },{
            icon: 'icon-view-module',
            name: 'Card View',
            url: 'app/main/apps/message-groups/views/subscribe/blocks/list-view.html'  
        }]
        vm.view = vm.views[0];
        vm.toggleView = function(){
            vm.view = vm.view == vm.views[0] ? vm.views[1] : vm.views[0];
        }

        vm.preventDefault = preventDefault;

        init();
        function init() {
            $q.all({
                groups:  message_service.getSubscribableGroups(),
            }).then(function (ret) {
                vm.groups = ret.groups;
                vm.groupCount = vm.groups.length;
                _.each(vm.groups, function(group){
                    group.$$visible = true;
                })
            }).finally(function () {
                vm.loading = false;
            });
        };

        vm.selectCategory = function(cat){
            vm.category = cat;
            filterGroups();
        }

        function filterGroups(){
            var NN=0, query = vm.search && vm.search.length && vm.search.toLowerCase(), category = vm.category && vm.category.id;
            _.each(vm.groups, function(group){
                group.$$visible = isGroupVisible(group)
            });
            vm.groupCount = NN;
            function isGroupVisible(group){
                if (category && group.category != category){
                    return false;
                }
                if (query){
                    if (group.name.toLowerCase().indexOf(query) == -1 && group.description.toLowerCase().indexOf(query) == -1) return false;
                };
                ++NN;
                return true;
            }
        }

        vm.viewGroupMessages = function(group){
            $state.go('app.mail.threads', {
                type  : group.id,
                filter: 'inbox'
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