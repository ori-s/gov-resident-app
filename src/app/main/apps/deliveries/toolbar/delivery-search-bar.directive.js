(function ()
{
    'use strict';

    angular
        .module('app.deliveries')
        .controller('DvSearchBarController', DvSearchBarController)
        .directive('dvSearchBar', dvSearchBarDirective);

    /** @ngInject */
    function DvSearchBarController($scope, $element, $timeout, DeliveriesService)
    {
        var vm = this;

        // Data
        vm.collapsed = true;
        vm.query = '';
        vm.change = function(){
            DeliveriesService.getFilteredOrders({query:vm.query});
        }
        vm.queryOptions = {
            debounce: vm.debounce || 0
        };

        // Methods
        vm.expand = expand;
        vm.collapse = collapse;


        /**
         * Expand
         */
        function expand()
        {
            // Set collapsed status
            vm.collapsed = false;

            // Call expand on scope
            $scope.expand();

            // Callback
            if ( vm.onExpand && angular.isFunction(vm.onExpand) )
            {
                vm.onExpand();
            }
        }

        /**
         * Collapse
         */
        function collapse()
        {
            // Empty the query
            vm.query = '';

            // Empty results to hide the results view
            DeliveriesService.getFilteredOrders({query:null});

            // Set collapsed status
            vm.collapsed = true;

            // Call collapse on scope
            $scope.collapse();

            // Callback
            if ( vm.onCollapse && angular.isFunction(vm.onCollapse) )
            {
                vm.onCollapse();
            }
        }



    }

    /** @ngInject */
    function dvSearchBarDirective($document)
    {
        return {
            restrict        : 'E',
            scope           : {},
            require         : 'dvSearchBar',
            controller      : 'DvSearchBarController as DvSearchBar',
            bindToController: {
                debounce     : '=?',
                onSearch     : '@',
                onResultClick: '&?',
                onExpand     : '&?',
                onCollapse   : '&?'
            },
            templateUrl     : 'app/main/apps/deliveries/toolbar/delivery-search-bar.html',
            compile         : function (tElement)
            {
                // Add class
                tElement.addClass('ms-search-bar');

                return function postLink(scope, iElement)
                {
                    // Data
                    var inputEl,
                        bodyEl = $document.find('body');

                    // Methods
                    scope.collapse = collapse;
                    scope.expand = expand;

                    //////////

                    // Initialize
                    init();

                    /**
                     * Initialize
                     */
                    function init()
                    {
                        // Grab the input element
                        inputEl = iElement.find('#ms-search-bar-input');
                    }

                    /**
                     * Expand action
                     */
                    function expand()
                    {
                        // Add expanded class
                        iElement.addClass('expanded');

                        // Add helper class to the body
                        bodyEl.addClass('ms-search-bar-expanded');

                        // Focus on the input
                        inputEl.focus();
                    }

                    /**
                     * Collapse action
                     */
                    function collapse()
                    {
                        // Remove expanded class
                        iElement.removeClass('expanded');

                        // Remove helper class from the body
                        bodyEl.removeClass('ms-search-bar-expanded');
                    }
                };
            }
        };
    }
})();