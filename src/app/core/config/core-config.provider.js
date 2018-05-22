(function ()
{
    'use strict';

    angular
        .module('app.core')
        .provider('coreConfig', coreConfigProvider);

    /** @ngInject */
    function coreConfigProvider()
    {
        // Default configuration
        var coreConfiguration = {
            'disableCustomScrollbars'        : false,
            'disableMdInkRippleOnMobile'     : true,
            'disableCustomScrollbarsOnMobile': true
        };

        // Methods
        this.config = config;

        //////////

        /**
         * Extend default configuration with the given one
         *
         * @param configuration
         */
        function config(configuration)
        {
            coreConfiguration = angular.extend({}, coreConfiguration, configuration);
        }

        /**
         * Service
         */
        this.$get = function ()
        {
            var service = {
                getConfig: getConfig,
                setConfig: setConfig
            };

            return service;

            //////////

            /**
             * Returns a config value
             */
            function getConfig(configName)
            {
                if ( angular.isUndefined(coreConfiguration[configName]) )
                {
                    return false;
                }

                return coreConfiguration[configName];
            }

            /**
             * Creates or updates config object
             *
             * @param configName
             * @param configValue
             */
            function setConfig(configName, configValue)
            {
                coreConfiguration[configName] = configValue;
            }
        };
    }

})();