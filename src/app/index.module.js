(function ()
{
    'use strict';

    /**
     * Main module of the Fuse
     */
    angular
        .module('fuse', [
            
            // Core
            'app.core',

            // Navigation
            'app.navigation',

            // Toolbar
            'app.toolbar',

            // Apps
            'app.auth',
            'app.home',
            'app.message-groups',
            'app.mail',
            //'app.orgs',
            //'app.deliveries'



        ]);
})();