(function ()
{
    'use strict';

    angular
        .module('app')
        .controller('IndexController', IndexController);

    /** @ngInject */
    function IndexController(fuseTheming, $localStorage, $cookies, $rootScope, $translate)
    {
        var vm = this;

        // Data
        vm.themes = fuseTheming.themes;

        $rootScope.app = {
            name: 'APPNAME',
            version: '1.0.0',
            settings: {
                "isRTL": true,
                "local": "he-il",
                "thene": "default"
            }
        }


        // save settings to local storage
        if (angular.isDefined($localStorage.exp_settings)) {
            $rootScope.app.settings = $localStorage.exp_settings;
        } else {
            $localStorage.exp_settings = $rootScope.app.settings;
        }
        $translate.use($rootScope.app.settings.local);
        fuseTheming.setActiveTheme($cookies.get('theme'));


        $rootScope.$on('$translateChangeSuccess', function(o, lang){
            $rootScope.app.settings.local = lang.language;
            $rootScope.activeLanguage = lang.language;
            changeLanguage(lang.language);
        });

        function changeLanguage(lang)
        {
            var doc =  document.querySelector('body');
            doc.classList.remove("_rtl");
            doc.classList.remove("_ltr");
            if (lang == "he-il"){
                doc.classList.add("_rtl");
                doc.setAttribute("dir","rtl");                
            }else{
                doc.classList.add("_ltr");
                doc.removeAttribute("dir");
            }
            vm.selectedLanguage = lang;
        }



        //////////
    }
})();