(function () {
    'use strict';
    angular
        .module('app.deliveries')
        .controller('DeliveriesMapDialogController', DeliveriesMapDialogController);

    /** @ngInject */
    function DeliveriesMapDialogController($scope, $mdDialog, $mdSidenav, $timeout, DeliveriesService, $mdMedia, delivery, site, handler) {
        var vm = this;
        vm.$mdMedia = $mdMedia;
        vm.TCS = DeliveriesService;
        vm.handler = handler;
        vm.disableRemove = true;

        vm.markOrderAsDelivered = function(order, cardHandler){
            DeliveriesService.markOrderAsDelivered(order, cardHandler).then(() => {
                if (vm.handler) vm.handler.call();
            });
        };

        vm.cancelOrderDelivered = function(order, cardHandler){
            DeliveriesService.cancelOrderDelivered(order, cardHandler).then(() => {
                vm.TCS.getFilteredOrders();                    
            });
        };

        vm.closeDialog = closeDialog;

        function closeDialog() {
            $mdDialog.hide();
        }
        vm.onDialogComplete = function(a, b){
           vm.ui.loaded = true;
        }

        vm.toggleSidenav = function(){
            $mdSidenav("map-sidenav").toggle();
        }
        vm.isLeftLockedOpen = true;
        vm.toggleMapSidenav = function() {
            if ($mdMedia('gt-md')) {
                vm.isLeftLockedOpen = !vm.isLeftLockedOpen;
            } else {
                vm.toggleSidenav('left-sidenav')
            };
            $timeout(function () {
                $(window).trigger('resize')
            }, 500);
        };

        vm.ui = {
            delivery:delivery,
            site: site

        };
        vm.orders = delivery.orders;
        vm.delivery = delivery;


        vm.mapOptions = {
            zoom: 4,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl:false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        vm.mapLoaded = false;
        var directionsService = new google.maps.DirectionsService();
        var infowindow = new google.maps.InfoWindow();

        var routeMarkers = {};
        vm.drawDirectionsDelay = function () {
            $timeout(vm.drawDirections, 500);
        };
        vm.locationClick = function (order) {

            if (order == vm.currentMarker) {
                var map = vm.myInfoWindow.getMap();
                if (map !== null && typeof map !== "undefined") {
                    vm.closeInfoWindow();
                    return;
                }
            }
            openMarkerInfo(routeMarkers[order._id], order);
        }
        vm.closeInfoWindow = function () {
            vm.myInfoWindow.close();
        };

        vm.drawDirections = function (optimize) {
            vm.closeInfoWindow();
            vm.ui.legs = [];
            var request = {
                travelMode: google.maps.TravelMode.DRIVING,
                origin: vm.startMarker.getPosition(),
                destination: vm.startMarker.getPosition(),

                waypoints: []
            };
            if (optimize) {
                request.optimizeWaypoints = true;//.push({optimize:true})
            }
            _.each(vm.orders, function (order, i) {
                if (!order.$$address) vm.TCS.prepareListOrder(order);
                request.waypoints.push({
                    location: order.$$address.location,
                    stopover: true
                });
            });
            directionsService.route(request, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    var routes = result.routes[0];
                    if (optimize) {
                        var arr = [];
                        _.each(result.routes[0].waypoint_order, function (v) {
                            arr.push(vm.orders[v]);
                        });
                        vm.orders = arr;
                    }

                    var duration = 0;
                    var distance = 0;
                    var parts = [];

                    _.each(routes.legs, function (leg, i) {
                        var order = vm.orders[i];
                        duration += leg.duration.value;
                        distance += leg.distance.value;
                        parts.push({
                            char: ("BCDEFGHIJKLMN").split()[i],
                            distance: leg.distance,
                            duration: leg.duration,
                            totalDuration: duration,
                            totalDistance: distance
                        });
                    });

                    vm.ui.legs = parts;
                    vm.ui.route = {
                        duration: duration,
                        distance: distance
                    };
                    vm.directionsDisplay.setDirections(result);
                };
            });
        };

        vm.onMapIdle = function () {

            if (vm.mapLoaded) return;
            vm.mapLoaded = true;
            vm.myMap = this.myMap
            vm.myInfoWindow = this.myInfoWindow;

            var map = vm.myMap;

            var bounds = new google.maps.LatLngBounds();
            var site = vm.ui.site;
            vm.startMarker = new google.maps.Marker({
                position: site.location.geometry.location,
                map: vm.myMap,
                title: site.name,
            });
            bounds.extend(vm.startMarker.getPosition());

            vm.directionsDisplay = new google.maps.DirectionsRenderer({ panel: document.getElementById("dvMapDirections") });
            vm.directionsDisplay.setMap(vm.myMap);

            _.each(site.delivery.regions, function (o) {
                var region = o;
                var poly = new google.maps.Polygon({
                    paths: o.paths,
                    map: vm.myMap,
                    strokeColor: '#000',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    fillColor: site.color,
                    fillOpacity: 0.2
                });
                var vertices = poly.getPath();
                for (var i = 0; i < vertices.getLength() ; i++) {
                    bounds.extend(vertices.getAt(i));
                }
            });

            _.each(vm.orders, function (order, i) {
                if (order._type == 'delivery' && !order.closed) {
                    var marker = new google.maps.Marker({
                        position: order.$$address.location,
                        map: vm.myMap,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 6,
                            fillOpacity: 0.4,
                            strokeWeight: 0,
                            strokeColor: '#bbb'
                        }
                    });
                    routeMarkers[order._id] = marker;
                    //order.$$marker = marker;
                    bounds.extend(marker.getPosition());
                    marker.addListener('click', function () {
                        vm.openMarkerInfo(marker, order);
                    });
                }
            })
            map.fitBounds(bounds);
            map.setZoom(map.getZoom() + 1);
            google.maps.event.trigger(map, 'resize')
            if (map.getZoom() > 15) {
                //map.setZoom(15);
            };
            vm.drawDirections();
        }



        vm.openMarkerInfo = openMarkerInfo;

        function openMarkerInfo(marker, order) {
            vm.currentMarker = order;
            $timeout(function () {
                $("#btn_gotogeo").off('click').click(function () {
                    vm.goToGeo(vm.currentMarker.$$address.formatted_address, vm.currentMarker);
                });
                $("#btn_editmarker").off('click').click(function () {
                    vm.editOrder(vm.currentMarker);
                });
                $("#btn_assignorder").off('click').click(function () {
                    $timeout(function () {
                        vm.assignOrder(vm.currentMarker);
                        marker.setIcon(vm.getOrderMapMarker(order));
                    });

                });
            });
            vm.myInfoWindow.open(vm.myMap, marker);
        };




    }
})();