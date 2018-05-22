(function () {
	'use strict';

	angular
        .module('app.core')
        .factory('resource_service', resource_service);

	function resource_service($state, $http, $q, $filter, blockUI, data_service, msUtils) {
        var resources = {
            "login": {
                simulated: true,
                type: "login",
                url: 'app/data/app_login.json'  
            },
            "resetPass": {
                simulated: true,
                type: "?Action=resetPass",
                url: 'app/data/blank.json'
            },
            "register": {
                simulated: true,
                type: "?Action=register",
                url: 'app/data/blank.json'
            },
            "meta": {
                simulated: true,
                type: "?Action=meta",
                url: 'app/data/app_meta.json'            
            },
            "userInfo": {
                simulated: true,
                type: "me",
                url: 'app/data/app_login.json'    
            },

            "users": {
                simulated: true,
                type: "algorithms",
                url: 'app/data/app_users.json'            
            },
            "groups": {
                simulated: true,
                type: "bus",
                url: 'app/data/app_groups.json'
            },
            "group_messages": {
                simulated: true,
                type: "carts",
                url: 'app/data/app_group_messages.json'
            },
            "group_subscribers": {
                simulated: true,
                type: "items",
                url: 'app/data/app_group_subscribers.json'
            }
        }

        // ------------------------------------------------------>
        
        var service = {
            resources: resources,
            get: get,
            save: save,
            delete: _delete,
            getDetails: getDetails,
            getEntities: getEntities 
        }
        
        // ------------------------------------------------------>

        function getEntities(types, data, args){
            var deferred = $q.defer();
            var q = {};
            _.each(types, function (ent) {
                q[ent] = service.get(ent, data, angular.copy(args));
            });
            $q.all(q).then(function (ret) {
                deferred.resolve(ret);
                window.setTimeout(function () { $(window).trigger('resize'); }, 400);
            }).catch(function (err) {
                deferred.resolve();
                console.error(err);
                window.setTimeout(function () { $(window).trigger('resize'); }, 400);
            });
            return deferred.promise;
        }

        function get(type, data, options){
            var resource = resources[type];
            if (resource) {
                if (resource.simulated) return getSimulated(resource, data, options);
                return data_service.get(resource.type, data, options)
            }
            return data_service.get(type, data, options)
        }   
 
        function getDetails(type, data, options){
            var resource = resources[type];
            if (resource) {
                if (resource.simulated) return getSimulated(resource, data, options).then(function(ret){
                    if (data){
                        ret = _.find(ret, data)
                    }
                    return ret;
                });
                return data_service.getDetails(resource.type, data, options)
            }
            return data_service.getDetails(type, data, options)
        }

        function save(type, data, options){
            var resource = resources[type];
            if (resource) {
                if (resource.simulated) return saveSimulated(resource, data, options);
                return data_service.save(resource.type, data, options)
            }
            return data_service.save(type, data, options)        
        }

        function _delete(type, data, options){
            var resource = resources[type];
            if (resource) {
                if (resource.simulated) return deleteSimulated(resource, data, options);
                return data_service.save(resource.type, data, options)
            }
            return data_service.save(type, data, options)        
        }

        // ------------------------------------------------------>

        function getSimulated(resource, data, options){
            if (resource.url) return data_service.getURL(_.extend({}, resource, options));
        }
        function saveSimulated(resource, data, options){
            var ret = _.clone(data);
            if (!ret.id){
                ret.id = msUtils.guidGenerator();
            }            
            return $q.resolve(ret)
        }
        function deleteSimulated(resource, data, options){
            return $q.resolve()
        }

        return service;

    }
    

}());