(function () {
    'use strict';
    angular
        .module('app.deliveries')
        .controller('DeliveriesOrderDialogController', DeliveriesOrderDialogController);

    /** @ngInject */
    function DeliveriesOrderDialogController($scope, $mdDialog, $timeout, DeliveriesService, $mdMedia, order, site) {
        var vm = this;
        vm.closeDialog = closeDialog;        
        vm.TCS = DeliveriesService;
        vm.$storage = {
            isModal: true,
            loading: true,
            orderId: order._id,
            order: order,
            site: site,
        }
        
        $scope.currentNavItem = 'od_menu_ge';
        $scope.goto = function(uid){
            var $child = $("#" + uid);


            if ($child[0]){
                var p = $child.parent();
                var sTop = $child.position().top;
                var st = p[0].scrollTop;
                $child[0].scrollIntoView();
                var newST = p[0].scrollTop;
                p[0].scrollTop = st;
                p.animate({ scrollTop: newST - 15 + "px" });
            }
            
        }

        function refreshOrder(order) {
            vm.$storage.loading = true;
            DeliveriesService.getCallCenterOrder(vm.$storage.orderId, { order: order, org: vm.$storage.siteId }).then(function (order) {
                vm.$storage.loading = false;
                if (order) prepareOrder(order);
                vm.order = vm.$storage.order = order;
            }).catch((err) => {
                console.error(err);
            });
        };
        refreshOrder(order);

        function closeDialog() {
            $mdDialog.hide();
        }

        //--------------------------------------------------------------------->
        // utilities
        //--------------------------------------------------------------------->

        function prepareOrder(order) {
            if (!order.orderer) order.orderer = {};
            var address = order.orderer.deliveryAddress;
            if (order._type == "delivery" && address) {
                if (!address.formatted_address) address.formatted_address = vm.TCS.getFormattedAddress(address);
                if (!address.location) {
                    address.location = vm.TCS.getGeoLocation(address.formatted_address).then(
                        function (location) {
                            if (!location.isPartial) address.location = location.location;
                        }
                    );
                };
            };

            var status = order.status;
            var remainderAmount = _.get(order, 'paymentSummary.$$remainderAmountWithChange', 0);
            var options = {
                canAddItems: status == "pending" || status == "inprep" || status == "assigned" || status == "taken",
                orderOpened: !order.closed,
                detailsSubmitAttempt: false,
                detailsDisabled: true,
                canEditDetails: !order.closed,
                canCancelItems: !order.closed,
                canRefund: !order.closed, //master switch for enabling refunds
                canRefundPayments: !order.closed,
                canRefundOrder: remainderAmount < 0,
                canAddPayment: remainderAmount > 0,
                remainderAmount: remainderAmount,
                canAddGeneralItem: !order.closed,
                informalTips: _.get(order, 'settings.tipBehavior') == "informal"
            };
            options.canAddDeliveryTip = options.informalTips && order._type == "delivery";


            order.$$stat = _.find(DeliveriesService.order_stats, { value: order.status });

            //FIX NOTES
            if (!order.orderTags || !order.orderTags[0]) order.orderTags = [""];

            //START PAYMENTS

            _.each(order.payments, function (payment) {
                payment.$$visible = true;
                if (payment.isPayout == true) {
                    payment.$$isRefund = true;
                    payment.$$canRefund = false;
                    if (payment.refundedPaymentId) {
                        var pPayment = _.find(order.payments, { _id: payment.refundedPaymentId });
                        if (pPayment) {
                            payment.$$visible = false;
                            pPayment.$$canRefund = false;
                            pPayment.$$refund = payment;
                        }
                    }
                } else {
                    payment.$$canRefund = !order.closed && payment.$$canRefund !== false;
                }
                payment.$$tip = options.informalTips && _.get(payment, "auxIntent.quantity", null);
                if (payment.$$tip) options.hasPaymentsTips = true;

                var atts = ["creditCardBrand", "last4"];
                var arr = [];
                _.each(atts, function (att) {
                    if (payment[att]) arr.push(payment[att]);
                });
                if (arr.length) payment.$$details = arr.join(", ");
            });
            //START FAILED PAYMENTS
            _.each(order.failedPayments, function (payment) {
                var pr = payment.paymentRequest;
                if (!pr) payment.paymentRequest = {};
                payment.$$tip = options.informalTips && _.get(payment, "paymentRequest.auxIntent.quantity", null);
                if (payment.$$tip) options.hasFaledTips = true;
            });

            _.extend(vm.$storage, options);

            //START GRATUITY
            var tipsTotal = 0;
            _.each(order.tips, function (tip) {
                if (tip.amount && !isNaN(tip.amount)) tipsTotal += tip.amount;
            });
            order.$$tipsTotal = tipsTotal;


            //START EXTERNAL SOURCE
            var externalErrors = _.get(order, 'externalSource.importIssues[0]');
            if (externalErrors) {
                order.$$externalErrors = true;
            }

            if (order.locked && UTILS.isSiteManager(order.organization)) {
                order.$$mayBeUnlocked = true;
            }

            //START PAYMENT INTENT
            if (order._type == "takeaway" && vm.$storage.canAddPayment) {
                order.$$displayResolveWithCash = true;
                if (!order.paymentIntent) {
                    order.paymentIntent = {};
                }
            }

            //START OWNER
            if (order.owner) {
                var owner = _.find(DeliveriesService.orgStaff, { _id: order.owner });
                if (owner) order.$$owner = owner;
            }

            //START COURIER
            if (order.courier) {
                var courier = _.find(DeliveriesService.orgStaff, { _id: order.courier });
                if (courier) order.$$courier = courier;
            }



            if (!order.diners || !order.diners.length) {
                order.diners = [{
                    _id: DeliveriesService.generateMongoObjectId(),
                    name: order.orderer.name,
                    tags: {
                        name: order.orderer.name
                    }
                }];
            } else {
                _.each(order.diners, function (diner, index) {
                    diner.name = diner.tags && diner.tags.name || ($translate.instant("TD.DINER") + " " + (index + 1));
                });
            };
            var defaultDinerId = order.diners[0]._id;
            order.orderer.dinerCount = order.diners.length;

            //START CANCEL
            var remainderAmount = _.get(order, 'paymentSummary.$$remainderAmountWithChange', 0);
            var totalAmount = _.get(order, 'paymentSummary.totalAmount', 0);
            let hasTip = _.get(order, 'paymentSummary.$$totalChange', 0) && !_.get(order, 'paymentIntent.waiveAuxAmount');
            var offersLength = order.orderedOffers.length;
            if (remainderAmount === 0 && totalAmount === 0 && offersLength === 0 && !hasTip) {
                order.$$canCancel = true;
            };

            var isOrderGI = false;

            //START ORDERED OFFERS
            _.each(order.orderedOffers, function (offer) {
                if (offer.adHocOffer && offersLength == 1) isOrderGI = true;

                offer.$$isRefund = offer.amount < 0;
                offer.$$amount = Math.abs(offer.amount);
                var items = [];

                _.each(offer.orderedItems, function (itemId) {
                    var item = _.find(order.orderedItems, { _id: itemId });
                    var hasSummary;
                    var summary = {};
                    if (item.selectedModifiers && item.selectedModifiers.length) {
                        
                        var _arr = [];
                        _.each(item.selectedModifiers, function (mod) {
                            if (!mod.isDefault) {
                                hasSummary = true;
                                _arr.push(mod.name);
                            }
                        });
                        summary.modWith = _arr.join(', ');
                    };
                    if (item.removedModifiers && item.removedModifiers.length) {
                        hasSummary = true;
                        var _arr = [];
                        _.each(item.removedModifiers, function (o) { if (o.name) _arr.push(o.name) });
                        summary.modWithout = _arr.join(', ');
                    };
                    if (hasSummary || item.note) item.$$summary = summary;

                    items.push(item);
                });
                if (items.length == 1 && !items[0].$$summary) offer.$$hideItems = true;
                offer.$$orderedItems = items;
                if (!offer.diner && !offer.adHocOffer) offer.diner = defaultDinerId;
            });

            var defDiner = _.get(order, "diners[0]._id");
            _.each(order.orderedItems, function (item) {
                if (item.cancellation && !item.diner) {
                    item.diner = defDiner;
                };
            });

            order.isOrderGI = isOrderGI;
            //START REWARDS
            _.each(order.orderedDiscounts, function (od) {
                var reward = _.find(order.rewards, { promotion: od._id });
                if (reward && reward.discount) od.$$discount = reward.discount;
            });
        }




    }
})();