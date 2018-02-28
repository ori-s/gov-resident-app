(function () {
    'use strict';
    angular
        .module('app.deliveries')
        .controller('DeliveriesReconcileDialogController', DeliveriesReconcileDialogController);

    /** @ngInject */
    function DeliveriesReconcileDialogController($scope, $mdDialog, $mdSidenav, $timeout, DeliveriesService, $mdMedia) {
        var vm = this;
        vm.$mdMedia = $mdMedia;
        vm.TCS = DeliveriesService;


        vm.closeDialog = closeDialog;
        function closeDialog() {
            $mdDialog.hide();
        }

        vm.worker = {};
        vm.ui = {};
        vm.loading = true;
        vm.init = function () {
            vm.TCS.getCourierOrders().then(function (orders) {
                vm.loading = false;
                vm.calculateOrders(orders);
                vm.orders = orders;
            });
        }
        vm.calculateOrders = function (orders) {
            let totalReconciled = { total: { v: 0, c: 0 }, tips: { v: 0, c: 0, r: 0 } };
            let totalOpen = { total: { v: 0, c: 0 }, tips: { v: 0, c: 0, r: 0 } };

            _.each(orders.filter(o => o.closed || o.$$mayReconcile), function (o, index) {
                if (index == 0 && _.get(o, 'settings.tipBehavior') == 'informal') {
                    vm.ui.informalTips = true;
                };

                DeliveriesService.getPreparedOrder_forclient_tips(o);

                //o.reconciled = true;
                //o.tipsTotal = Math.random() * 150 * 10;

                o.reconciled = o.reconciled === true;
                let address = o.orderer && o.orderer.deliveryAddress;
                if (address) {
                    if (!address.formatted_address) address.formatted_address = vm.TCS.getFormattedAddress(address);
                    o.$$address = address.formatted_address;
                };

                let total = 0;

                o.paymentsCalc = {};

                if (!o.reconciled) {
                    totalOpen.total.c += 1;
                    if (o.tipsTotal) {
                        totalOpen.tips.c += 1;
                        totalOpen.tips.v += o.tipsTotal;
                    }
                } else {
                    totalReconciled.total.c += 1;
                    if (o.tipsTotal) {
                        totalReconciled.tips.c += 1;
                        totalReconciled.tips.v += o.tipsTotal;
                    }
                };

                _.each(o.payments, function (p) {
                    if (p.tenderType === "cash") {
                        o.$$hasCash = true;
                        if (o.tipsTotal) {
                            if (!o.reconciled) {
                                totalOpen.tips.r += o.tipsTotal;
                            } else {
                                totalReconciled.tips.r += o.tipsTotal;
                            }
                        }
                    }
                    if (!o.paymentsCalc[p.accountName]) {
                        o.paymentsCalc[p.accountName] = { v: 0, c: 0, name: p.accountName, tt: p.tenderType };
                    }
                    if (p.isPayout) {
                        p.amount = p.amount * -1;
                    }
                    o.paymentsCalc[p.accountName].v += p.amount;
                    o.paymentsCalc[p.accountName].c += 1;
                    total += Number(p.amount);
                });

                _.each(o.paymentsCalc, function (val, accName) {
                    let target, targetTotal;
                    if (!o.reconciled) {
                        target = totalOpen[accName];
                        if (!target) target = totalOpen[accName] = { v: 0, c: 0, tt: val.tt };
                        targetTotal = totalOpen.total;
                    } else {
                        target = totalReconciled[accName];
                        if (!target) target = totalReconciled[accName] = { v: 0, c: 0, tt: val.tt };
                        targetTotal = totalReconciled.total;
                    }
                    target.c += 1;
                    target.v += val.v;
                    targetTotal.v += val.v;
                });

                o.amount = total;
            });
            vm.ui.totalOpen = totalOpen;
            vm.ui.totalOpenArr = fixTotals(totalOpen);
            vm.ui.totalOpenRefundCurrier = getRefundCourier(totalOpen, vm.ui.totalOpenArr);

            vm.ui.totalReconciled = totalReconciled;
            vm.ui.totalReconciledArr = fixTotals(totalReconciled);
            //vm.ui.totalReconciledRefundCurrier = getRefundCourier(totalReconciled, vm.ui.totalReconciledArr); 
        };

        vm.init();


        function fixTotals(_totals) {
            var arr = [];
            var wasCash;
            _.each(_totals, function (val, key) {
                val.key = key;
                if (key != 'total') {
                    if (val.tt == "cash") {
                        wasCash = true;
                        arr.push(val);
                    } else {
                        if (val.v > 0) arr.unshift(val);
                    }
                }
            });
            if (!wasCash) {
                arr.push({ key: $translate.instant("TD.TENDERS.CASH"), tt: "cash", v: 0, c: 0 })
            };
            return arr;
        };


        function getRefundCourier(_totals, _arrTotals){
            var cash = _.find(_arrTotals, {tt:"cash"});
            cash = cash && cash.v || 0;
            if (!vm.ui.informalTips){
                return cash;
            }else{
                var tips = _.get(_totals,"tips.v",0);
                return cash - tips;
            }
        }


    }
})();