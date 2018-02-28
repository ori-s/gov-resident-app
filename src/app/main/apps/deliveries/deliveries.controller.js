(function ()
{
    'use strict';

    angular
        .module('app.deliveries')
        .controller('DeliveriesController', DeliveriesController);


    /** @ngInject */
    function DeliveriesController($scope, $document, $mdSidenav, $q, data_service, authorization_service, $state, blockUI, DeliveriesService, $mdBottomSheet, $mdMedia, $timeout, $interval, $mdDialog)
    {
        var vm = this;
        vm.loading = true;
        vm.loadingOrders = true;
        vm.TCS = DeliveriesService;
        vm.search = '';
        vm.searchToolbar = false;
        vm.toggleSidenav = toggleSidenav;        

        vm.filters = {
            stats: [],
            types: []
        };

        vm.ui = {
            loading: true,
            markers:{},
            orders:[]
        };

        vm.init = function () {
            blockUI.start();
            $q.all({
                site: DeliveriesService.getSiteSetup_data(),
            }).then(function (ret) {
                if (!ret.site){
                    blockUI.stop();
                    return;
                }
                blockUI.stop();
                vm.ui.site = ret.site;
                vm.getOrders();
                vm.ui.loading = false;
            }, function () {
                blockUI.stop();
            });
        };

        var stopInterval, mapTimeout;

        vm.stopOrders = function(){
            if (angular.isDefined(stopInterval)) {
                $interval.cancel(stopInterval);
                stopInterval = undefined;
            };
        };

        vm.getOrders = function(){
            vm.stopOrders();
            vm.getOrders_real();
            //stopInterval = $interval(vm.getOrders_real, 1000 * 60);
        };

        vm.getOrders_real = function () {
            vm.loadingOrders = true;
			DeliveriesService.getSiteDeliveryOrders().then(function (ret) {
                vm.loadingOrders = false;
            }).catch(function (err) {
                DeliveriesService.displayServerError(err);
                vm.loadingOrders = false;
            });
        };


        // -------------------------------------
        // ui functions
        // -------------------------------------


        /**
         * Toggle sidenav
         *
         * @param sidenavId
         */
        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }

        // -------------------------------------
        // order functions
        // -------------------------------------


        vm.markOrderAsDelivered = function(order, cardHandler){
            DeliveriesService.markOrderAsDelivered(order, cardHandler).then(() => {
                vm.TCS.getFilteredOrders();                    
            });
        };

        vm.cancelOrderDelivered = function(order, cardHandler){
            DeliveriesService.cancelOrderDelivered(order, cardHandler).then(() => {
                vm.TCS.getFilteredOrders();                    
            });
        };

        vm.viewDelivery = function(delivery){
            var worker = angular.copy(_.find(vm.ui.staff, {_id:delivery.courier}));
            worker.delivery = {orders:[]};

            _.each(delivery.orders, function(orderId){
                worker.delivery.orders.push(_.find(vm.ui.orders,{_id:orderId}));
            });
            vm.TCS.viewDelivery(delivery, vm.ui.site ,worker).then(function(ret){
                vm.sendDelivery(worker);
            });
        };


        vm.showDeliveryMap = function(delivery, ev){
            $mdDialog.show({
                controller: "DeliveriesMapDialogController",
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/deliveries/dialogs/map/map-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: true,
                fullscreen : true,
                onComplete : function(scope, element){
                    scope.vm.onDialogComplete();
                },
                locals: {
                    delivery: delivery,
                    site: vm.ui.site,
                    handler: vm.getFilteredOrders,
                }
            }).then(function (response) { }, function () { });
        }



        // -------------------------------------
        // order functions
        // -------------------------------------       

        $scope.$on('$destroy', function () {
            $timeout.cancel(mapTimeout);
            vm.stopOrders();
        });


        // Methods
        
        vm.init();

        


    }
})();