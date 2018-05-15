(function () {
    'use strict';

    angular
        .module('app')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, $timeout, $state, authorization_service, meta_service, blockUIConfig, $templateCache, $mdSidenav, ENV) {
        blockUIConfig.templateUrl = 'my-templates/block-ui-overlay.html';
        $templateCache.put('my-templates/block-ui-overlay.html', '<div class=\"block-ui-overlay\"></div><div class=\"block-ui-message-container\" aria-live=\"assertive\" aria-atomic=\"true\"><div class=\"block-ui-message\"><md-progress-circular class="md-accent" md-diameter="60" md-mode="indeterminate"></md-progress-circular></div></div>');

        // Activate firebase
        var fbConfig = ENV.fbConfig;
        firebase.initializeApp(fbConfig);
        firebase.auth().signInWithEmailAndPassword("ori@123.com", "123456").catch(function (error) {
            console.log(error);
        }).then(function () {
            console.log('FB initialized!');
        });
        $rootScope.MS = meta_service;

        $rootScope.closeOnMobile = function(sidnavId){
            var sidenav = $mdSidenav(sidnavId);
            if (sidenav && !sidenav.isLockedOpen()) sidenav.close();
        }

        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            // Activate loading indicator
            $rootScope.loadingProgress = true;
            meta_service.sectionCaption = "";
            if (toState.name.indexOf("app.auth_") != 0) {
                if (!authorization_service.isAuthenticated()) {
                    authorization_service.toState = toState.name;
                    authorization_service.toParams = toParams;
                    $state.transitionTo("app.auth_login");
                    event.preventDefault();
                }else{
                    return;
                    // will implement on v1 of ui router
                    var roles = _.get(toState, 'data.auth[0]');
                    if (roles && !meta_service.checkAccess(roles)){
                        $state.transitionTo("app.noaccess");
                        event.preventDefault();
                    }
                }
            }
        });


        // De-activate loading indicator
        var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function () {
            $timeout(function () {
                $rootScope.loadingProgress = false;
            });
        });

        // Store state in the root scope for easy access
        $rootScope.state = $state;

        // Cleanup
        $rootScope.$on('$destroy', function () {
            stateChangeStartEvent();
            stateChangeSuccessEvent();
        });
    }
})();