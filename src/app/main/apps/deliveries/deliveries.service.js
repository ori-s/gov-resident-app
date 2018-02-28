(function ()
{
    'use strict';

    angular
        .module('app.deliveries')
        .factory('DeliveriesService', DeliveriesService)
        .filter('money', moneyFilter)
        .filter('amount', amountFilter)
        .filter('secondsDuration', secondsDurationFilter);
        

    function DeliveriesService($q, data_service, authorization_service, $translate, $mdDialog, blockUI, $timeout) {

        var service = {
            simulated: true,
            auth: authorization_service,
            getSiteSetup_data : getSiteSetup_data,

            locals: {
                "he-IL": {
                    angularLocal: "he-il",
                    momentLocal: "he",
                    isRTL: true,
                    transLang: "he-IL",
                    currecySymbol: "\u20aa",
                    mapSearchLocalComponents: "country:IL|street_address",
                    mapLanguage: "iw"
                },
                "en-US": {
                    angularLocal: "en-us",
                    momentLocal: "en",
                    isRTL: false,
                    transLang: "en",
                    currecySymbol: "$",
                    mapSearchLocalComponents: "country:US|street_address",
                    mapLanguage: "en"
                }
            },

            tdTypeMap: {
                "takeaway": "TA",
                "eatin": "OTC",
                "delivery": "Delivery"
            },
            tdTypeMapClient: {
                "TA": "takeaway",
                "OTC": "eatin",
                "Delivery": "delivery",
                "Seated": "seated",
            },
            tdServiceTypeMap: {
                "eatin": "seated"
            },
            tdOrderTypeMap: {
                "Seated": "eatin"
            },
            tdTenderMap: {
                "CASH": "cash",
                "CREDIT": "creditCard",
                "CIBUS": "Cibus",
                "TENBIS": "10bis"
            },
            orderRewardsTypeMap: {
                amount: "AmountOffOrder",
                percent: "PercentOffOrder"
            },
            order_types: [{
                "value": "delivery",
                "text": $translate.instant("TD.SERVICES.delivery"),
                "icon": "tabit-delivery",
                "image": "images/delivery_new.svg"
            }, {
                "value": "takeaway",
                "text": $translate.instant("TD.SERVICES.takeaway"),
                "icon": "tabit-takeaway",
                "image": "images/ta_new.svg"
            }, {
                "value": "eatin",
                "text": $translate.instant("TD.SERVICES.eatin"),
                "icon": "tabit-eatin",
                "image": "images/eatin_new.svg",
            }, {
                "value": "seated",
                "text": $translate.instant("TD.SERVICES.seated"),
                "icon": "tabit-eatin",
                "image": "images/eatin_new.svg",
            }],
            order_stats: [{
                "value": "pending",
                "text": $translate.instant("TD.ORDER_STAT.pending"),
                "icon": "tabit-hour-glass",
                "marker": "modules/td_orders/images/marker-pending-info.png",
                "marker_base": "modules/td_orders/images/marker-pending",
                "bg": "bg-default",
                "color": "text-warning",
                
            }, {
                "value": "inprep",
                "text": $translate.instant("TD.ORDER_STAT.inprep"),
                "icon": "tabit-fire",
                "marker": "modules/td_orders/images/marker-inprep-info.png",
                "marker_base": "modules/td_orders/images/marker-inprep",
                "bg": "bg-danger dker",
                "color": "text-danger"
            }, {
                "value": "assigned",
                "text": $translate.instant("TD.ORDER_STAT.assigned"),
                "icon": "tabit-ic_profile",
                "marker": "modules/td_orders/images/marker-assigned-info.png",
                "marker_base": "modules/td_orders/images/marker-assigned",
                "bg": "bg-success",
                "color": "text-success",
            }, {
                "value": "taken",
                "text": $translate.instant("TD.ORDER_STAT.taken"),
                "icon": "icon-bike",
                "marker": "images/markers/marker-taken.png",
                "marker_base": "modules/td_orders/images/marker-taken",
                "bg": "md-accent",
                "color": "text-success",
                "visibleToCourier": true,
                "active": true,
            },
            {
                "value": "delivered",
                "text": $translate.instant("TD.ORDER_STAT.delivered"),
                "icon": "icon-check",
                "marker": "modules/td_orders/images/marker-closed.png",
                "marker_base": "modules/td_orders/images/marker-closed",
                "bg": "md-green-600-bg",
                "color": "text-success",
                "visibleToCourier": true,
                "active": true,
            },
            {
                "value": "closed",
                "text": $translate.instant("TD.ORDER_STAT.closed"),
                "icon": "tabit-checkmark",
                "marker": "modules/td_orders/images/marker-closed.png",
                "marker_base": "modules/td_orders/images/marker-closed",
                "bg": "bg-success",
                "color": "text-success",
                "visibleToCourier": true,
                "active": false,
            }, {
                "value": "prepared",
                "text": $translate.instant("TD.ORDER_STAT.prepared"),
                "icon": "tabit-fire",
                "marker": "modules/td_orders/images/marker-inprep-info.png",
                "marker_base": "modules/td_orders/images/marker-inprep",
                "bg": "bg-danger dker",
                "color": "text-danger"
            }],
            sentToKitchenStates: ['fired', 'prepared'],
            order_statsMap: {},
            order_typesMap: {},
            userId: '59d492b628cd4c24000a8aa4',
            filters: {showDeliveredOrders:true}
        }
        
        service.local = service.locals["he-IL"];

        _.each(service.order_stats, function (o) {
            service.order_statsMap[o.value] = o
        });
        _.each(service.order_types, function (o) {
            service.order_typesMap[o.value] = o
        });

        

        function getSiteSetup_data(){
            service.orders = service.deliveries = service.deliveriesView = null;
            service.filters = {showDeliveredOrders:true};

            var config = {headers:{"ros-organization":authorization_service.organization.id}};
            return data_service.get('/configuration/onlineShopper', config).then(function(ret){
                ret = _.get(ret, "[0].config");
                return ret;
            }).catch(function (err) {
                console.error(err);
                return null;
            });  


            return $q.reject();
        }

        //--------------------------------------------------------------------------------------->
        // orders
        //--------------------------------------------------------------------------------------->

        service.getSiteDeliveryOrders = function () {
            blockUI.start()
            if (service.simulated){
                
                var deffered = $q.defer();
                $timeout(function(){
                    $q.all({
                        orders: data_service.getURL("app/data/deliveries/orders.json"),
                        deliveries: data_service.getURL("app/data/deliveries/deliveries.json"),
                    }).then(ret => deffered.resolve(getSiteDeliveryOrders_cont(ret))).catch(err => {console.error(err);}).finally(() => {blockUI.stop()});
                },1000);
                return deffered.promise;
                
            }else{
                return $q.all({
                    orders: data_service.get('/orders?orderType=TA&orderType=Delivery&ownerChannelType=webCallCenter'),
                    deliveries: data_service.get('/deliveries'),
                }).then(getSiteDeliveryOrders_cont).catch(err => {console.error(err);}).finally(() => {blockUI.stop()});         
            }


            function getSiteDeliveryOrders_cont(ret){
                var deliveries = [], orders = [], userId= _.get(service, 'auth.user._id');
                _.each(ret.deliveries, delivery => {
                    if (delivery.courier == userId){
                        delivery.orders = [];
                        _.each(delivery.items, item => {
                            var order = _.find(ret.orders, {_id: item.order});
                            if (order){
                                order = service.getPreparedOrder_forclient(order, { isSummery: true });
                                service.prepareListOrder(order)
                                if (true){
                                    delivery.orders.push(order);
                                    orders.push(order);                                
                                }
                            }
                        });
                        if (delivery.orders.length){
                            delivery.$$number = _.padStart((delivery.number + ''), 2, '0');
                            delivery.created = new Date(delivery.created);
                            deliveries.push(delivery);                        
                        }
                    }
                })
                service.orders = orders,
                service.deliveries = deliveries,
                service.deliveriesView = service.getFilteredOrders();
                return true;
            }
        };

        service.getFilteredOrders = function(args){
            if (args){
                service.filters.search = args.query;
            }
            var query = service.filters.search && service.filters.search.toLowerCase();
            if (query && !query.length) query = null;
            
            var stats = service.filters.showDeliveredOrders ? null : ['taken'];
            var types = service.filters.types;
            if (!types || !types.length) types = null;

            _.each(service.deliveries, (delivery) => {
                delivery.$$visible = false;
                _.each(delivery.orders, (order) => {
                    order.$$visible = isOrderVisible(order);
                    if (order.$$visible) delivery.$$visible = true;
                })            
            });

            function isOrderVisible(order){
                if (stats && stats.indexOf(order.status) == -1) return false;
                if (types && types.indexOf(order._type) == -1) return false;
                if (query){
                    if (order.code && order.code.indexOf(query) != -1) return true;
                    else if (order.$$contact_name && order.$$contact_name.toLowerCase().indexOf(query) != -1) return true;
                    else if (order.$$contact_cell && order.$$contact_cell.toLowerCase().indexOf(query) != -1) return true;
                    return false;
                };
                return true
            }
        };

        service.showDeliveriesSummary = function(ev){
            $mdDialog.show({
                controller: "DeliveriesReconcileDialogController",
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/deliveries/dialogs/reconcile/reconcile-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: true,
                fullscreen : true,
                locals: {}
            }).then(function (response) { }, function () { });
        }

		service.getCallCenterOrder = function (orderId, args = {}) {
            if (service.simulated){
				return data_service.getURL("app/data/deliveries/order.json").then(order => {
					return service.getPreparedOrder_forclient(order);
				})
            }

			let org = (args.order && args.order.organization) || args.org;
			let query = {};
			if (org) query.organization = { _id: org };
			if (args.order && args.order.closed) {
				return data_service.get('/tlogs/' + orderId).then(order => {
					return service.getPreparedOrder_forclient(order);
				})
			} else {
                return data_service.get('/orders/' + orderId).then(order => {
					return service.getPreparedOrder_forclient(order);                    
				});
			}
		};

		service.getCourierOrders = function (courier) {            
            //inpact-int.herokuapp.com/businessDays/current
			return data_service.get('/businessDays/current').then(businessDay => {
                if (true){
				    return $q.all({
                        orders: data_service.getURL("app/data/reconcile/orders.json"),
					    tlogs: data_service.getURL("app/data/reconcile/documents_v2.json")
				    }).then(data => {
					    let balancedOrders = data.orders.filter(o => o.balance === 0);
					    let orders = balancedOrders.concat(data.tlogs.map(tl => tl.order[0]));
					    return service.getPreparedOrders_forclient(orders);
				    });
                }

				return $q.all({
                    // /documents/v2?fromBusinessDate=2017-10-28T00:00:00.000Z&order.courier=5937ac675f02332800b9effa&order.orderType=TA&order.orderType=Delivery&toBusinessDate=2017-10-28T00:00:00.000Z
					orders: ServiceAgent.getData('orders', {
						orderType: ['TA', 'Delivery'], courier: courier._id,
						fullOrderRequired: true
					}),
                    // /orders?courier=5937ac675f02332800b9effa&fullOrderRequired=true&orderType=TA&orderType=Delivery
					tlogs: ServiceAgent.getData('documents/v2', {
						"order.orderType": ['TA', 'Delivery'],
						"order.courier": courier._id,
						fromBusinessDate: businessDay.businessDate,
						toBusinessDate: businessDay.businessDate
					})
				}).then(data => {
					let balancedOrders = data.orders.filter(o => o.balance === 0);
					let orders = balancedOrders.concat(data.tlogs.map(tl => tl.order[0]));
					return service.getPreparedOrders_forclient(orders);
				})
			});
		};

        service.markOrderAsDelivered_server = function(){
            return $q.resolve();
        }
        service.cancelOrderDelivered_server = function(){
            return $q.resolve();
        }

        service.markOrderAsDelivered = function(order, cardHandler){
            if (order.$$loading) return;
            var deffered = $q.defer();
            order.$$loading;
            cardHandler.call();
            $timeout(function(){
                service.markOrderAsDelivered_server(order).then(function(){
                    var stat = "delivered";
                    var $$stat = _.find(DeliveriesService.order_stats, { value: stat });
                    order.status = stat;
                    order.$$stat = $$stat;
                    order.$$anim = 'pulse-in';
                    order.deliveredDate = new Date();
                    deffered.resolve();
                    $timeout(() => {delete order.$$anim},500);
                }).catch().finally(() => {
                    order.$$loading = false;
                    deffered.reject();
                });
            },400);
            return deffered.promise;
        };
        service.cancelOrderDelivered = function(order, cardHandler){
            if (order.$$loading) return;
            var deffered = $q.defer();
            order.$$loading;
            cardHandler.call();
            $timeout(function(){
                service.cancelOrderDelivered_server(order).then(function(){
                    var stat = "taken";
                    var $$stat = _.find(DeliveriesService.order_stats, { value: stat });
                    order.status = stat;
                    order.$$stat = $$stat;
                    order.$$anim = 'pulse-in';
                    order.deliveredDate = new Date();
                    deffered.resolve();
                    $timeout(() => {delete order.$$anim},500);
                }).catch().finally(() => {
                    order.$$loading = false;
                    deffered.reject();
                });
            },400);
            return deffered.promise;
        };

		service.removeFromDelivery = function (delivery, order) {
			let deliveryId = delivery._id;
			let orderId = order._id;
            if (service.simulated) return $q.resolve();
			return data_service.delete(`/deliveries/${deliveryId}/items/${orderId}`);            
		};
 
        function getDeliveryRoute_forClient(deliveryRoute) {
            if (!deliveryRoute) return deliveryRoute;
            deliveryRoute.orders = deliveryRoute.items.map(i => i.order);
            deliveryRoute.date = (deliveryRoute.dispatched && deliveryRoute.dispatched.at) || deliveryRoute.created;
            return deliveryRoute;
        }




        // ------------------------------------------------------------------------------------------------->
        // getPreparedOrder_forclient
        // ------------------------------------------------------------------------------------------------->

        service.getPreparedOrders_forclient = function (orders, options = {}) {
            var ret = [];
            _.each(orders, function (order) {
                ret.push(service.getPreparedOrder_forclient(order, options));
            });
            return ret;
        };

        const lifeCycleToStatus = {
            opened: 'pending',
            fired: 'inprep',
            taken: 'taken',
            delivered: 'closed',
            prepared: 'prepared'
        };
        const preAssignedStatus = ['pending', 'inprep', 'prepared'];

        service.getPreparedOrder_forclient = function (order, options = {}) {
            //, { isSummery: true}
            if (order.order) order = order.order;
            order._type = service.tdTypeMapClient[order.orderType];
            order.status = 'pending';
            let lifeCycle = order.lifeCycle && order.lifeCycle.name;
            if (lifeCycle)
                order.status = lifeCycleToStatus[lifeCycle] || 'pending';
            if (order.courier && preAssignedStatus.some(o => o === order.status)) {
                order.status = 'assigned';
            }
            if (order.closed) order.status = 'closed';
            order.assignedTo = order.courier;
            order.canDispatch = service.sentToKitchenStates.some(s => s === lifeCycle) && order.courier;
            order.reconciled = !!order.closed;
            order.$$mayReconcile = !order.reconciled && (order.status === 'taken');
            order.visibleToSite = !_.get(order, 'ownerChannel.type') || order.reconciled;
            if (!order.visibleToSite) {
                order.maySendToSite = order.balance === 0 ||
                    _.get(order, 'paymentIntent.resolveBalanceWithCash');
            }
            (order.orderedItems || []).forEach(o => {
                o.notes = o.note;
            });
            let waiveAuxAmount = _.get(order, 'paymentIntent.waiveAuxAmount');
            if(options.isSummery) {
                order.paymentSummary.$$totalPaidWithChange = order.paymentSummary.paidAmount + order.paymentSummary.totalAuxAmount;
                order.paymentSummary.$$totalChange = order.paymentSummary.totalAuxAmount;
            } else {
                order.paymentSummary.$$totalPaidWithChange = 0;
                order.paymentSummary.$$totalChange = 0;
                (order.payments || []).forEach(o => {
                    o.$amount = o.faceValue || o.amount;
                    o.$$tip = _.get(o, 'auxIntent.quantity', 0);
                    let multip = o.isPayout ? -1 : 1;
                    order.paymentSummary.$$totalPaidWithChange += (o.$amount * multip);
                    order.paymentSummary.$$totalChange += ((_.get(o, 'change.amount', 0) + _.get(o, 'cashback.amount', 0)) * multip);
                });
            }

            order.$$cashInOutNeeded = service.cashInOutNeeded(order);
            order.paymentSummary.$$remainderAmountWithChange = (order.paymentSummary.totalAmount + (waiveAuxAmount ?  0 : order.paymentSummary.$$totalChange)) -
                order.paymentSummary.$$totalPaidWithChange;
            return order;
        };

        service.cashInOutNeeded = function(order){
            return !!(order.paymentSummary.cashIn || order.paymentSummary.cashOut);
        };

        service.getPreparedOrder_forclient_tips = function (order) {
            let tipsTotal = 0;
            if (order.settings.tipBehavior !== 'informal') {
                _.each(order.tips, tip => {
                    if (tip.amount && !isNaN(tip.amount)) tipsTotal += tip.amount;
                });
            } else {
                _.each(order.payments, payment => {
                    if (payment.auxAmount && !isNaN(payment.auxAmount)) tipsTotal += payment.isPayout ? -1 * payment.auxAmount : payment.auxAmount;
                });
            }
            order.tipsTotal = tipsTotal;
        };

        //--------------------------------------------------------------------->
        // prepare list order
        //--------------------------------------------------------------------->

        service.prepareListOrder = function (order, site) {
            order.$$number = _.padStart((order.number + ''), 2, '0')
            order.$$offers = _.map(order.orderedOffers, "name").join(", ");
            order.$$type = _.find(service.order_types, { value: order._type });
            order.$$stat = _.find(service.order_stats, { value: order.status });
            order.$$isDelivery = order._type == "delivery" && order.status != 'pending';
            if (order.orderer) {
                order.$$contact_name = order.orderer.name;
                order.$$contact_cell = order.orderer.phone;
                order.$$contact_notes = order.orderer.notes
                var address = order.orderer.deliveryAddress;
                if (order._type == "delivery" && address) {
                    order.$$address = address;
                    if (!address.formatted_address) address.formatted_address = service.getFormattedAddress(address);
                    if (!address.location) {
                        address.location = service.getGeoLocation(address.formatted_address).then(
                            function (location) {
                                order.$$address.location = location;
                                prepareListOrder_region(order.$$address);
                            }
                        ).catch(function(){
                            order.$$address.$$error = true;
                        });
                    }else{
                        prepareListOrder_region(order.$$address);
                    };
                    order.$$contact_address = address.formatted_address;
                    var arr = [];
                    if (address.floor) arr.push($translate.instant("TD.FLOOR") + ": " + address.floor);
                    if (address.entrance) arr.push($translate.instant("TD.ENTRANCE") + ": " + address.entrance);
                    if (address.apartment) arr.push($translate.instant("TD.APPARTMENT") + ": " + address.apartment);
                    if (address.notes && address.notes.length){
                        order.$$addressNodes = address.notes;
                    }
                    order.$$addressEx = arr.join(", ");

                }
            };
            order.$$notes = _.get(order,"orderTags[0]",null);
            order.$$closed = order.$$stat.value == 'closed';

            function prepareListOrder_region(_address){
                if (site){
                    var region = service.isSiteServeAddress(site, _address);
                    if (region) address.region = region.name;
                }
            };
        };

        service.isSiteServeAddress = function (site, address) {
            if (!address.location) return;
            for (var i = 0; i < site.delivery.regions.length; i++) {
                var r = site.delivery.regions[i];
                var point = new google.maps.LatLng(address.location.lat, address.location.lng);
                var poly = new google.maps.Polygon({
                    paths: r.paths
                });
                if (google.maps.geometry.poly.containsLocation(point, poly)) {
                    return (r);
                };
            }
        };

	    service.getFormattedAddress = function (address) {
            if (address.street && address.house){
                return address.street + " " + address.house + ", " + address.city;
            }
		    return address.city;
	    };

        // ------------------------------------------------------------------------------------------------->
        // getPreparedCuriers_forclient
        // ------------------------------------------------------------------------------------------------->


        function _extendCourierData_forclient(couriers, orders) {
            let courierOnOrder = orders.reduce((courierDir, order) => {
                if (_.get(order, 'delivery.dispatched')) {
                    courierDir[order.courier] = true;
                }
                return courierDir;
            }, {});
            couriers.forEach(courier => {
                courier.ordersTaken = courierOnOrder[courier._id];
                courier.$$visible = courier.ordersTaken || courier.active;
            });
            return couriers;
        };

        service.getPreparedCuriers_forclient = function (curiers) {
            var ret = [];
            _.each(curiers, function (curier) {
                ret.push(service.getPreparedCurier_forclient(curier));
            });
            return ret;
        };
        service.getPreparedCurier_forclient = function (courier) {
            courier.name = courier.firstName + " " + courier.lastName;
            courier.active = courier.lastClock &&
                (courier.lastClock.as === "TD" && courier.lastClock.operation === "in");
            return courier;
        };



        // ------------------------------------------------------------------------------------------------->
        // utilities
        // ------------------------------------------------------------------------------------------------->

        service.areYouSure = function(options,ev){
            var deferred = $q.defer();
            var confirm = $mdDialog.confirm()
                      .title($translate.instant("TD.ARE_YOU_SURE"))
                      //.textContent('All of the banks have agreed to forgive you your debts.')
                      //.ariaLabel('Lucky day')
                      .targetEvent(ev)
                      .ok($translate.instant("TD.YES"))
                      .cancel($translate.instant("TD.NO"));


                $mdDialog.show(confirm).then(function() {
                  deferred.resolve();
                }, function() {
                  deferred.reject();
                });
            return deferred.promise;
        }

        service.callPhone = function(tel){
            window.location.href="tel://"+tel;
        }
        service.goToGeo = function(to, site){
            var sURL = "http://maps.google.com/?saddr=Current%20Location&daddr=" + to;
            if (site) {
                var site = _.find($scope.ui.settings.sites, { _id: site.site_id });
                if (site) {
                    var sURL = "http://maps.google.com/?saddr=" + site.location.formatted_address + "&daddr=" + to;
                }
            };
            window.open(sURL);
        }

        service.showOrderDetails = function(order, site, ev){
            $mdDialog.show({
                controller: "DeliveriesOrderDialogController",
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/deliveries/dialogs/order/order-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: true,
                fullscreen : true,
                locals: {
                    order: order,
                    site: site
                }
            }).then(function (response) { }, function () { });
        }

        service.displayServerError = function(err){
            $mdDialog.show(
            $mdDialog.alert()
                .title($translate.instant('ERROR'))
                .textContent(err.message)
                .ok("OK")
                .targetEvent(event));
        }

	    service.generateMongoObjectId = function () {
		    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
		    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
			    return (Math.random() * 16 | 0).toString(16);
		    }).toLowerCase();
	    }

        service.notImplemented = function () {
            $mdDialog.show(
            $mdDialog.alert()
                .title($translate.instant('KDS.SORRY'))
                .textContent($translate.instant('KDS.NOT_IMPLEMENTED_YET'))
                .ok($translate.instant('KDS.OK'))
                .targetEvent(event));
        }

        return service;
    }



function amountFilter($filter, DeliveriesService) {
    return function (text, decimals, abs) {
        decimals = decimals === 0 ? 0 : decimals || 2;
        if (!isNaN(text)){
            text /= 100;
            if (abs) text = Math.abs(text);
        }        
        return DeliveriesService.local.currecySymbol + $filter('number')(text, decimals);
    };
}

function moneyFilter($filter, DeliveriesService) {
    return function (text, decimals) {
        decimals = decimals === 0 ? 0 : decimals || 2;
        return DeliveriesService.local.currecySymbol + $filter('number')(text, decimals);
    };
}
function secondsDurationFilter($translate) {
    return function (val) {
        return $translate.instant('TD.FORMAT_MINUTES', { m: Math.floor(val / 60) })
    };
}




})();