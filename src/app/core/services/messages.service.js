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
            //counters
            unreadMessages: null,
            pendingMessages:null,
            markedMessages:null,
            urgentMessages:null
        }

        service.init = function(){
            //simulation init the messages servicw
            service.started = false;
            $timeout(function(){
                service.started= true;
                service.unreadMessages = 10;
                service.pendingMessages = 15;
                service.starredMessages = 9;
                service.urgentMessages = 2;
            },500)
        }


        service.getEditableGroups = function(){
            return data_service.get('groups', {});
        }

        service.getSubscribableGroups = function(){
            return data_service.get('groups', {'active':true}).then(function(groups){
                //simulation
                _.each(groups, function(group, index){
                    if (index < 5){
                        group.subscribed = true;
                    }                    
                });
                return groups;
            });;
        }

        service.getSubscribedGroups = function(){
            return data_service.get('groups', {subscribed:true}).then(function(groups){
                //simulation
                return _.filter(groups, function(group, index){
                    if (index < 5){
                        group.subscribed = true;
                        return true;
                    }                    
                })
            });
        }

        service.getMessages = function(args){
            service.activeMessages = [];
            service.activeArgs = args;
            
            return data_service.get('group_messages', args).then(function(messages){
                // simulation
                if (args.type) messages = _.filter(messages, { "groupId": args.type }); 
                messages = prepareMessageSimulation(messages);
                
                switch(args.filter){
                    case "urgent": 
                        messages = _.filter(messages, {urgent:true});
                        break;
                    case "unread": 
                        messages = _.filter(messages, {read:false});
                        break;
                    case "starred": 
                        messages = _.filter(messages, {starred:true});
                        break;
                    case "scheduled": 
                        messages = _.filter(messages, {scheduled:true});
                        break;
                }
                // end simulation

                service.activeMessages = messages;
                return messages;
            })
        }

        service.setMessageThreadStatus = function(message, prop, value){
        
        }
        service.addMessageComment = function(comment, message, parentComment){
            //simulation add message comment
            _.extend(comment, {
                created: new Date(),
                user: {
                    name: authorization_service.user.name,
                    id: authorization_service.user.id,
                    avatar: "assets/images/avatars/Abbott.jpg"
                }
            });
            
            if (!message.comments)message.comments = [];
            message.comments.push(comment);
            return $q.resolve(comment);
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
                messages = prepareMessageSimulation(messages);
                return _.filter(messages, {scheduled:true});
            })
        }

        service.mailFolders = [{
            "id": "inbox",
            "name": "MAIL.All Messages",
            "icon": "icon-check-all"
        },{
            "id": "urgent",
            "name": "Urgent Messages",
            "icon": "icon-bell-ring"
        },{
            "id": "unread",
            "name": "Unread Messages",
            "icon": "icon-email"
        },{
            "id": "starred",
            "name": "Marked Messages",
            "icon": "icon-check-all"
        },{
            "id": "scheduled",
            "name": "Pending Messages",
            "icon": "icon-clock"
        }];

        function prepareMessageSimulation(messages){
            var d = moment();
            var n = 1;
            _.each(messages, function(message, index){
                message.starred = Math.floor(Math.random() * 10) < 2;
                message.read = index > 10;
                if (message.scheduled){
                    message.scheduled = true;
                    message.urgent = n < 3;

                    message.reminderDate = moment().add(n, 'days').toDate();
                    message.scheduleDate = moment().add(++n, 'days').toDate();
                    if (!message.reminderText) message.reminderText = $translate.instant("I am a message reminder");
                    message.alert = n < 3;
                }                
            });
            return messages;        
        }

        return service;
        

    });




}());