(function () {
	'use strict';

	angular
        .module('app.core')
        .factory('resource_service', resource_service);

	function resource_service($state, $http, $q, $filter, blockUI, data_service, msUtils) {
        var SIMULATED = false;
        var resources = {
            "login": {
                simulated: SIMULATED,
                type: "login",
                url: 'app/data/login.json'  
            },
            "resetPass": {
                simulated: SIMULATED,
                type: "?Action=resetPass",
                url: 'app/data/blank.json'
            },
            "register": {
                simulated: SIMULATED,
                type: "?Action=register",
                url: 'app/data/blank.json'
            },
            "meta": {
                simulated: SIMULATED,
                type: "appMeta",
                url: 'app/data/meta.json'            
            },
            "userInfo": {
                simulated: SIMULATED,
                type: "userInfo",
                url: 'app/data/login.json'    
            },

            "groups": {
                simulated: SIMULATED,
                type: "groups",
                isEntity: true,
                url: 'app/data/groups.json'
            },
            "editable_groups":{
                simulated: SIMULATED,
                type: "groups",
                isEntity: true,
                url: 'app/data/groups.json'
            },
            "subscribable_groups":{
                simulated: SIMULATED,
                type: "groups",
                isEntity: true,
                url: 'app/data/groups.json'
            },
            "group_messages": {
                simulated: SIMULATED,
                type: "group_messages",
                isEntity: true,
                url: 'app/data/group_messages.json'
            },
            "group_subscribers": {
                simulated: SIMULATED,
                type: "group_subscribers",
                isEntity: true,
                url: 'app/data/group_subscribers.json'
            },
            "group_subscription":{
                simulated: SIMULATED,
                type: "group_subscription",
                url: 'app/data/group_subscription.json'            
            },
            "message_counters": {
                simulated: SIMULATED,
                type: "message_counters",
                url: 'app/data/message_counters.json'
            },
            "message_status": {
                simulated: SIMULATED,
                type: "message_status",
                url: 'app/data/blank.json'                
            },
            "message_comment": {
                simulated: SIMULATED,
                type: "message_comment",
                url: 'app/data/message_comment.json'                
            }
        }

        // ------------------------------------------------------>
        
        var service = {
            resources: resources,
            get: get,
            post: post,
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

        function post(type, data, options){
            var resource = resources[type];
            if (resource) {
                if (resource.simulated) return getSimulated(resource, data, options);
                return data_service.post(resource.type, data, options)
            }
            return data_service.post(type, data, options)
        }   

        function get(type, data, options){
            var resource = resources[type];
            if (resource) {
                if (resource.simulated) return getSimulated(resource, data, options);
                if (resource.isEntity) return data_service.getRows(resource.type, data, options);
                else return data_service.get(resource.type, data, options)
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
                return data_service.delete(resource.type, data, options)
            }
            return data_service.delete(type, data, options)        
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