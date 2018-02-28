(function ()
{
    'use strict';

    angular
        .module('app.core')
        .directive('msRightClick', msRightClick);


    /** @ngInject */
    function msRightClick($parse){
        return function(scope, element, attrs) {
            var fn = $parse(attrs.msRightClick);
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            });
        };
    }
})();