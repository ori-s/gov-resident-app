(function ()
{
    'use strict';

    angular
        .module('app.mail')
        .controller('MailController', MailController);

    /** @ngInject */
    function MailController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state, msApi, $q, $translate, message_service)
    {
        var vm = this;

        // Data
        vm.accounts = {
            'creapond'    : 'johndoe@creapond.com',
            'withinpixels': 'johndoe@withinpixels.com'
        };
        vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
        vm.selectedAccount = 'creapond';
        vm.addComment = addComment;
        vm.folders = [];
        vm.labels = [];
        //vm.loadingThreads = true;

        vm.currentFilter = {
            filter: $state.params.filter || "inbox",
            type  : $state.params.type || null            
        };
        vm.currentThread = null;
        vm.selectedThreads = [];

        vm.views = {
            classic: 'app/main/apps/mail/views/classic/classic-view.html',
            outlook: 'app/main/apps/mail/views/outlook/outlook-view.html'
        };
        vm.defaultView = 'outlook';
        vm.currentView = 'outlook';

        // Methods
        vm.loadFolder = loadFolder;
        vm.loadFilter = loadFilter;
        vm.openThread = openThread;
        vm.closeThread = closeThread;

        vm.isSelected = isSelected;
        vm.toggleSelectThread = toggleSelectThread;
        vm.selectThreads = selectThreads;
        vm.deselectThreads = deselectThreads;
        vm.toggleSelectThreads = toggleSelectThreads;

        vm.setThreadStatus = setThreadStatus;
        vm.toggleThreadStatus = toggleThreadStatus;

        vm.changeView = changeView;

        vm.composeDialog = composeDialog;
        vm.subscribeToGroups = subscribeToGroups;
        vm.replyDialog = replyDialog;

        vm.toggleSidenav = toggleSidenav;


        //////////

        init();

        /**
         * Initialize
         */
        function init()
        {
            // Figure out the api name
            

            var apiName = 'mail.' + ($state.params.type || 'folder') + '.' + $state.params.filter + '@get';

            var groupId = $state.params.filter;
            $q.all({
                folders: message_service.getSubscribedGroups(),
                threads:message_service.getMessages(vm.currentFilter)
            }).then(
                // Success
                function (response)
                {
                    // Load new threads
                    vm.threads = response.threads;
                    vm.folders = response.folders;
                    vm.filters = message_service.mailFolders;
                    
                    // Hide the loading screen
                    vm.loadingThreads = false;
                    generateCrumbs();
                    // Open the thread if needed
                    if ( $state.params.threadId )
                    {
                        var thread = _.find(vm.threads, {id:$state.params.threadId});
                        if (thread) vm.openThread(thread);
                    }
                }
            );
        }

        vm.crumbs = [];
        function generateCrumbs(){
            var arr = [];
            var o = _.find(vm.filters, {id:vm.currentFilter.filter});
            if (o) arr.push(o.name);
            var o = _.find(vm.folders, {id:vm.currentFilter.type});
            if (o) arr.push(o.name);
            vm.crumbs = arr;
        }

        // Watch screen size to change view modes
        $scope.$watch(function ()
        {
            return $mdMedia('xs');
        }, function (current, old)
        {
            if ( current )
            {
                vm.currentView = 'classic';
            }
        });

        $scope.$watch(function ()
        {
            return $mdMedia('gt-xs');
        }, function (current, old)
        {
            if ( current )
            {
                if ( vm.defaultView === 'outlook' )
                {
                    vm.currentView = 'outlook';
                }
            }
        });


        function loadFilter(filter)
        {
            if ( filter.id == vm.currentFilter.filter )
            {
                if ( vm.currentThread )
                {
                    vm.closeThread();
                }
                return;
            }
            getMessages({
                filter: filter.id,
                type  : vm.currentFilter.type
            });
        }

        function loadFolder(folder)
        {
            var folderId = folder.id;
            if ( folderId == vm.currentFilter.type )
            {
                folderId = null;
            }
            getMessages({
                filter: vm.currentFilter.filter,
                type  : folderId
            });
        }

        function getMessages(args){
            $rootScope.loadingProgress = true;
            $state.go('app.mail.threads', args, {notify: false});
            message_service.getMessages(args).then(
                function (response)
                {
                    vm.threads = response;
                    vm.currentFilter = args;
                    generateCrumbs();
                    if ( vm.currentThread )
                    {
                        vm.closeThread();
                    }
                    $rootScope.loadingProgress = false;
                }
            );
        }


        function openThread(thread)
        {
            // Set the read status on the thread
            thread.read = true;
            setThreadStatus("read", true, thread)
            vm.currentThread = thread;
            vm.newComment = null;
            // Update the state without reloading the controller
            $state.go('app.mail.threads.thread', {threadId: thread.id}, {notify: false});
        }

        function closeThread()
        {
            vm.newComment = null;
            vm.currentThread = null;
            $state.go('app.mail.threads', {
                type  : vm.currentFilter.type,
                filter: vm.currentFilter.filter
            }, {notify: false});
        }

        /**
         * Return selected status of the thread
         */
        function isSelected(thread)
        {
            return vm.selectedThreads.indexOf(thread) > -1;
        }

        /**
         * Toggle selected status of the thread
         */
        function toggleSelectThread(thread, event)
        {
            if ( event )
            {
                event.stopPropagation();
            }

            if ( vm.selectedThreads.indexOf(thread) > -1 )
            {
                vm.selectedThreads.splice(vm.selectedThreads.indexOf(thread), 1);
            }
            else
            {
                vm.selectedThreads.push(thread);
            }
        }

        /**
         * Select threads. If key/value pair given,
         * threads will be tested against them.
         */
        function selectThreads(key, value)
        {
            // Make sure the current selection is cleared
            // before trying to select new threads
            vm.selectedThreads = [];

            for ( var i = 0; i < vm.threads.length; i++ )
            {
                if ( angular.isUndefined(key) && angular.isUndefined(value) )
                {
                    vm.selectedThreads.push(vm.threads[i]);
                    continue;
                }

                if ( angular.isDefined(key) && angular.isDefined(value) && vm.threads[i][key] === value )
                {
                    vm.selectedThreads.push(vm.threads[i]);
                }
            }
        }

        /**
         * Deselect threads
         */
        function deselectThreads()
        {
            vm.selectedThreads = [];
        }

        /**
         * Toggle select threads
         */
        function toggleSelectThreads()
        {
            if ( vm.selectedThreads.length > 0 )
            {
                vm.deselectThreads();
            }
            else
            {
                vm.selectThreads();
            }
        }

        /**
         * Set the status on given thread, current thread or selected threads
         */
        function setThreadStatus(key, value, thread, event)
        {
            if ( event )
            {
                event.stopPropagation();
            }


            if (!thread) thread = vm.currentThread;
            if ( thread )
            {
                if (thread[key] == value) return;
                thread[key] = value;
                message_service.setMessageThreadStatus(thread, key, value);
                if (key == 'delete'){
                    var index = _.findIndex(vm.threads, {id: thread.id});
                    if (index >= 0) vm.threads.splice(index,1)
                    vm.closeThread();
                }
                return;
            }

            return;
            //batch operations
            for ( var x = 0; x < vm.selectedThreads.length; x++ )
            {
                vm.selectedThreads[x][key] = value;
            }
        }

        function toggleThreadStatus(key, thread, event)
        {
            if ( event )
            {
                event.stopPropagation();
            }

            if (!thread) thread = vm.currentThread;
            if ( thread )
            {
                if ( typeof(thread[key]) !== 'boolean' )
                {
                    thread[key] = false;
                }

                thread[key] = !thread[key];
                message_service.setMessageThreadStatus(thread, key, thread[key]);
                return;
            }
            return;

            // batch operations disabled for now
            for ( var x = 0; x < vm.selectedThreads.length; x++ )
            {
                if ( typeof(vm.selectedThreads[x][key]) !== 'boolean' )
                {
                    continue;
                }

                vm.selectedThreads[x][key] = !vm.selectedThreads[x][key];
            }
        }
        
        vm.newComment = null;
        function addComment(thread, comment){
            message_service.addMessageComment({message: vm.newComment}, thread, comment).then(function(){vm.newComment = null});
        }


        function changeView(view)
        {
            if ( vm.views[view] )
            {
                vm.defaultView = view;
                vm.currentView = view;
            }
        }

        function subscribeToGroups(ev){
            $state.go('app.message-groups.subscribe');
        }

        function composeDialog(ev)
        {
            $mdDialog.show({
                controller         : 'ComposeDialogController',
                controllerAs       : 'vm',
                locals             : {
                    selectedMail: undefined
                },
                templateUrl        : 'app/main/apps/mail/dialogs/compose/compose-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : ev,
                clickOutsideToClose: true
            });
        }

        function replyDialog(ev)
        {
            $mdDialog.show({
                controller         : 'ComposeDialogController',
                controllerAs       : 'vm',
                locals             : {
                    selectedMail: vm.selectedMail
                },
                templateUrl        : 'app/main/apps/mail/dialogs/compose/compose-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : ev,
                clickOutsideToClose: true
            });
        }

        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }
    }
})();