(function ()
{
    'use strict';

    angular
        .module('app.home')
        .controller('HomeController', HomeController);


    /** @ngInject */
    function HomeController($scope, $mdSidenav, $q, data_service, message_service, $state, blockUI, $mdMedia, $mdDialog)
    {
        var vm = this;
        vm.loading = true;
        vm.MSS = message_service;
        vm.counters = [{
            name: "Unread Messages",
            icon: "icon-email",
            bg: "light-blue-bg",
            state      : 'app.mail.threads',
            stateParams: {
                filter: 'unread'
            },
            field: "unreadMessages"
        },{
            name: "Pending Messages",
            icon: "icon-clock",
            bg: "green-bg",
            state: "app.message-groups.schedule",
            field: "pendingMessages"
        },{
            name: "Marked Messages",
            icon: "icon-star",
            bg: "blue-grey-bg white-fg",
            state      : 'app.mail.threads',
            stateParams: {
                filter: 'starred'
            },
            field: "markedMessages"
        },{
            name: "Urgent Messages",
            icon: "icon-bell-ring",
            bg: "deep-purple-bg white-fg",
            state      : 'app.mail.threads',
            stateParams: {
                filter: 'urgent'
            },
            field: "urgentMessages"
        }];

        vm.services = [{
            name: "Moked 106",
            icon: "icon-phone-log",
            bg: "white-bg",
            state: "app.resident.106"
        },{
            name: "Education",
            icon: "icon-android-studio",
            bg: "white-bg",
            state: "app.resident.education"
        },{
            name: "Arnona and License",
            icon: "icon-hospital-building",
            bg: "white-bg",
            state: "app.resident.arnona"
        },{
            name: "Wellfare",
            icon: "icon-human",
            bg: "white-bg",
            state: "app.resident.wellfare"
        }];

        vm.goTo = function(o){
            $state.go(o.state, o.stateParams);
        }

    }
})();