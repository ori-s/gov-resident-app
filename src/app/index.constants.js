(function ()
{
    'use strict';
    var app = angular.module('fuse');
    app.constant('ENV', {
        //apiEndpoint:'https://inpact-demo.herokuapp.com',
        //"apiEndpoint": "https://ros-prd.herokuapp.com",
        "apiEndpoint": "https://inpact-int.herokuapp.com",
        //managerDashSimulated: true
        forceEndpoint: true,
	    "fbConfig": {
		    "apiKey": "AIzaSyBcF_Z2zlrjOlHCe_hVWFkq1saYta2RPGI",
		    "authDomain": "tabitorder.firebaseapp.com",
		    "databaseURL": "https://tabitorder.firebaseio.com",
		    "storageBucket": "tabitorder.appspot.com"
	    },

    });
    app.constant('PROFILES', ['H', 'K', 'B', 'W', 'M', 'TD', 'CD', 'OTC'])
    app.constant('RESPONSIBILITIES', ['STAFF', 'MENU']);

})();
