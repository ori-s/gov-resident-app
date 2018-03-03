(function () {
    'use strict';
    var app = angular.module('app.core');

    app.factory('message_service', function ($q, $translate, authorization_service, MetaService, data_service) {
        var service = {
            groups: [],
            filters: [],

            //for mail viewer
            activeGroup: null,
            activeMessages: []
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

        return service;
        

    });




}());