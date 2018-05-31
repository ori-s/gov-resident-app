(function () {
    'use strict';
    var app = angular.module('app.core');

    app.factory('message_service', function ($q, $translate, authorization_service, meta_service, resource_service, $timeout, $mdDialog, msUtils) {
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
            service.started = false;
            resource_service.post('message_counters').then(function(ret){
                service.started= true;
                _.extend(service, {
                    unreadMessages: null,
                    pendingMessages: null,
                    markedMessages: null,
                    urgentMessages: null
                },ret);
            });
        }

        // return groups that are editable by the current user
        service.getEditableGroups = function(){
            return resource_service.get('editable_groups', {});
        }

        /* return groups that the user can subscribe to, subscribed groups have: 
         * subscribed = true,
         * subscription = {email ,sms , calendar}
         */ 
        service.getSubscribableGroups = function(){
            return resource_service.get('subscribable_groups', {}).then(function(groups){
                //simulation
                _.each(groups, function(group, index){
                    if (index < 5){
                        group.subscribed = true;
                        group.subscription = {
                            id: 123,
                            groupId: group.id,
                            email: true,
                            sms: true,
                            calendar: true
                        };
                    }                    
                });
                //end simulation 
                return groups;
            });;
        }

        // return the groups the user is subscribed to
        service.getSubscribedGroups = function(){
            return resource_service.get('groups', {subscribed:true}).then(function(groups){
                //simulation
                groups = _.filter(groups, function(group, index){
                    if (index < 5){
                        group.subscribed = true;
                        return true;
                    }                    
                });
                //end simulation 
                return groups;
            });
        }

        /* return messages according to:
         * args.type, optional, represent groupId
         * args.filter, optional, can be urgent, unread, starred, scheduled
         * urgent and scheduled are message properties
         * unread, starred are message/user properties
         */ 
        service.getMessages = function(args){
            service.activeMessages = [];
            service.activeArgs = args;
            
            return resource_service.get('group_messages', args).then(function(messages){
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
        
        /*
         * add status to message/user. 
         * prop: delete, read, starred
         * value: true/false
         */
        service.setMessageThreadStatus = function(message, prop, value){
            var data = {messageId:message.id, property:prop, value:value};
            return resource_service.post('message_status', data, {hideLoading:true}).then(function(ret){
                return true;
            });
        }

        /*
         * add comment to message* 
         */
        service.addMessageComment = function(comment, message, parentComment){
            var data = {messageId:message.id, comment:comment, parentComment:parentComment};
            return resource_service.post('message_comment', data, {hideLoading:true}).then(function(comment){
                // simulation
                _.extend(comment, {
                    created: new Date(),
                    user: {
                        name: authorization_service.user.name,
                        id: authorization_service.user.id,
                        avatar: "assets/images/avatars/Abbott.jpg"
                    }
                });
                // end simulation
                return comment;
            });
        }


        service.setGroupSubscription = function(group, subscription){
            var data = {
                groupId: group.id,
                subscription: subscription,
                action: subscription ? 'update' : "delete"
            }

            return resource_service.post('group_subscription', data).then(function(ret){
                // simulation
                if (ret.subscription) _.extend(ret.subscription, subscription);
                //end simulation

                group = _.clone(group);
                if (ret.subscription){
                    group.subscribed = true;
                    group.subscription = ret.subscription;
                }else{
                    group.subscribed = null;
                    group.subscription = null;
                }
                msUtils.showSimpleToast("Upadate Successfully");
                return group;
            });
        };


        service.handleGroupSubscription = function (group, ev) {
            var deffered = $q.defer();
            $mdDialog.show({
                controller: 'GroupDialogController',
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/message-groups/dialogs/group/group-dialog.html',
                targetEvent: ev,
                //fullscreen: true,
                clickOutsideToClose: true,
                locals: {
                    Group: group
                }
            }).then(function (response) {
                if(response){
                    group.subscribed = response.subscribed;
                    group.subscription = response.subscription;
                    group.$$anim = 'pulse-in';
                    $timeout(() => {delete group.$$anim},500);
                    deffered.resolve(group);
                }else{
                    deffered.resolve();
                }
            }, function () { 
                deffered.resolve();
            });;

            return deffered.promise;
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