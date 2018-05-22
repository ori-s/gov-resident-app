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

        // return groups that are editable by the current user
        service.getEditableGroups = function(){
            return resource_service.get('groups', {});
        }

        service.getSubscribableGroups = function(){
            return resource_service.get('groups', {'active':true}).then(function(groups){
                //simulation
                _.each(groups, function(group, index){
                    if (index < 5){
                        group.subscribed = true;
                        group.subscription = {
                            email: true,
                            sms: true,
                            calendar: true
                        };
                    }                    
                });
                return groups;
            });;
        }

        service.getSubscribedGroups = function(){
            return resource_service.get('groups', {subscribed:true}).then(function(groups){
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
        

        service.setMessageThreadStatus = function(message, prop, value){
            //add status to message/user. prop: delete, read, starred
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


        service.setGroupSubscription = function(group, subscription){
            group = _.clone(group);
            if (subscription){//update the user's group subscription
                group.subscribed = true;
                group.subscription = subscription;
            }else{//remove the subscription
                group.subscribed = null;
                group.subscription = null;
            }
            msUtils.showSimpleToast("Upadate Successfully");
            return $q.resolve(group);
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