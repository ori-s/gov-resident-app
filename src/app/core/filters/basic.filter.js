(function () {
    'use strict';

    angular
        .module('app.core')
        .filter('mapList', mapListFilter)
        .filter('mapEnt', mapEntFilter)
        .filter('propsFilter', propsFilter)
        .filter('msEnt', msEntFilter)
        .filter('nFormat', nFormatFilter)
        .filter('sArray', sArrayFilter)

        .filter('tel', telFilter)
        .filter('distance', distanceFilter)
        .filter('toTrusted', toTrustedFilter)
        .filter('htmlToPlaintext', htmlToPlainTextFilter)
        .filter('nospace', nospaceFilter)
        .filter('humanizeDoc', humanizeDocFilter);

    function mapListFilter() {
        return function (native, options, matchField, valueField) {
            if (!matchField) matchField = "value";
            if (!valueField) valueField = "text";
            if (options) {
                for (var i = 0; i < options.length; i++) {
                    if (options[i][matchField] == native) {
                        return options[i][valueField];
                    }
                }
            }
            return '';
        }
    }
    function mapEntFilter() {
        return function (native, options) {
            var matchField = "id", valueField = "name";
            if (options) {
                for (var i = 0; i < options.length; i++) {
                    if (options[i][matchField] == native) {
                        return options[i][valueField];
                    }
                }
            }
            return '';
        }
    }

    function propsFilter() {
        return function (items, props) {
            var out = [];

            if (angular.isArray(items)) {
                items.forEach(function (item) {
                    var itemMatches = false;

                    var keys = Object.keys(props);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop] ? props[prop].toLowerCase() : '';
                        if (item[prop] && item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    }

    function msEntFilter() {
        return function (ms, entList) {
            var ret = [];

            _.each(ms, function (v) {
                var o = _.find(entList, { id: v });
                if (o) ret.push(o.name);
            });
            return ret.join(", ");
        };
    }

    function nFormatFilter($filter) {
        return function (input, format) {
            if (!input) return '';
            switch (format) {
                case 'P': return $filter('number')(input, 2) + '%';
                case 'C': return $filter('currency')(input);
                case 'N': return $filter('number')(input, 2);
                case 'I': return $filter('number')(input, 0);
                case 'D': return $filter('date')(input, 'MMM/dd/yyyy');
            }
            return input;
        };
    }
    function sArrayFilter() {
        return function (input) {
            if (!input) return '';
            if (_.isArray(input)) return input.join(", ");
            return input;
        };
    }

    /** @ngInject */
    function telFilter() {
        return function (tel) {
            if (!tel) { return ''; }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10: // +1PPP####### -> C (PPP) ###-####
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11: // +CPPP####### -> CCC (PP) ###-####
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12: // +CCCPP####### -> CCC (PP) ###-####
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country == 1) {
                country = "";
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            return (country + " (" + city + ") " + number).trim();
        };
    }

    /** @ngInject */
    function distanceFilter($translate) {
        return function (val) {
            return $translate.instant('TD.FORMAT_DISTANCE', { km: (val / 1000).toFixed(1) })
        };
    }

    /** @ngInject */
    function toTrustedFilter($sce) {
        return function (value) {
            return $sce.trustAsHtml(value);
        };
    }

    /** @ngInject */
    function htmlToPlainTextFilter() {
        return function (text) {
            return String(text).replace(/<[^>]+>/gm, '');
        };
    }

    /** @ngInject */
    function nospaceFilter() {
        return function (value) {
            return (!value) ? '' : value.replace(/ /g, '');
        };
    }

    /** @ngInject */
    function humanizeDocFilter() {
        return function (doc) {
            if (!doc) {
                return;
            }
            if (doc.type === 'directive') {
                return doc.name.replace(/([A-Z])/g, function ($1) {
                    return '-' + $1.toLowerCase();
                });
            }
            return doc.label || doc.name;
        };
    }

})();