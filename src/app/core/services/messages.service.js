(function () {
    'use strict';
    var app = angular.module('app.core');

    app.factory('message_service', function ($q, $translate, authorization_service, MetaService, data_service, $timeout) {
        var service = {
            started: false,
            groups: [],
            filters: [],

            //for mail viewer
            activeGroup: null,
            activeMessages: [],

            unreadMessages: null,
            pendingMessages:null,
        }

        service.init = function(){
            //simulation init the messages servicw
            $timeout(function(){
                service.unreadMessages = Math.floor(Math.random() * 30);
                service.pendingMessages = Math.floor(Math.random() * 30);
            })
        }


        service.getSubscribedGroups = function(){
            return data_service.get('groups', {subscribed:true});
        }

        service.getMessages = function(groupId){
            service.activeMessages = [];
            service.activeGroup = groupId;

            var args = groupId ? {groupId: groupId} : null;
            return data_service.get('group_messages', args).then(function(ret){
                if (groupId && groupId != "inbox") ret = _.filter(ret, { "groupId": groupId }); // simulation
                service.activeMessages = ret;
                return ret;
            })
        }

        service.setMessageThreadStatus = function(message, prop, value){
        
        }

        service.getEditableGroups = function(){
            return data_service.get('groups', {});
        }

        service.getSubscribableGroups = function(){
            return data_service.get('groups', {'active':true});
        }

        service.toggleGroupSubscribed_server = function(group){
            return $q.resolve(); //simulation
        }
        service.toggleGroupSubscribed = function(group, cardHandler){
            if (group.$$loading) return;
            var deffered = $q.defer();
            group.$$loading;
            if (cardHandler)cardHandler.call();
            $timeout(function(){
                service.toggleGroupSubscribed_server(group).then(function(){
                    group.subscribed = !group.subscribed;
                    group.$$anim = 'pulse-in';
                    deffered.resolve();
                    $timeout(() => {delete group.$$anim},500);
                }).catch().finally(() => {
                    group.$$loading = false;
                    deffered.reject();
                });
            },400);
            return deffered.promise;

        }

        service.getScheduledMessages = function(){
            service.pendingMessages = Math.floor(Math.random() * 30);

            return data_service.get('group_messages', {scheduled:true, subscribed:true}).then(function(messages){
                //simulation
                var ret = [];
                var d = moment();
                var n = 1;
                _.each(messages, function(message){
                    if (message.scheduled){
                        message.reminderDate = moment().add(n, 'days').toDate();
                        message.scheduleDate = moment().add(++n, 'days').toDate();
                        if (!message.reminderText) message.reminderText = $translate.instant("I am a message reminder");
                        message.alert = n < 3;
                        ret.push(message);
                    }
                
                });
                return ret;
            })
        }

        return service;
        

    });




}());