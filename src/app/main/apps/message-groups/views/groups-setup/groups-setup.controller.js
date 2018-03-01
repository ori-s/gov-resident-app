(function ()
{
    'use strict';

    angular
        .module('app.message-groups')
        .controller('GroupsSetupController', GroupsSetupController);

    /** @ngInject */
    function GroupsSetupController($state, Groups)
    {
        var vm = this;

        // Data
        vm.groups = Groups;

        vm.dtInstance = {};
        vm.dtOptions = {
            dom         : 'rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
            columnDefs  : [
                {
                    // Target the image column
                    targets   : 0,
                    filterable: false,
                    sortable  : false,
                    width     : '80px'
                },
                {
                    // Target the status column
                    targets   : 5,
                    filterable: false,
                    render    : function (data, type)
                    {
                        if ( type === 'display' )
                        {
                            if ( data === 'true' )
                            {
                                return '<i class="icon-checkbox-marked-circle green-500-fg"></i>';
                            }

                            return '<i class="icon-cancel red-500-fg"></i>';
                        }

                        if ( type === 'filter' )
                        {
                            if ( data )
                            {
                                return '1';
                            }

                            return '0';
                        }

                        return data;
                    }
                },
                {
                    // Target the actions column
                    targets           : 6,
                    responsivePriority: 1,
                    filterable        : false,
                    sortable          : false
                }
            ],
            initComplete: function ()
            {
                var api = this.api(),
                    searchBox = angular.element('body').find('#message-groups-setup-search');

                // Bind an external input as a table wide search box
                if ( searchBox.length > 0 )
                {
                    searchBox.on('keyup', function (event)
                    {
                        api.search(event.target.value).draw();
                    });
                }
            },
            pagingType  : 'simple',
            lengthMenu  : [10, 20, 30, 50, 100],
            pageLength  : 20,
            scrollY     : 'auto',
            responsive  : true
        };

        // Methods
        vm.gotoAddGroup = gotoAddGroup;
        vm.gotoGroupDetail = gotoGroupDetail;

        //////////
        function gotoAddGroup()
        {
            $state.go('app.message-groups.groups-setup.add');
        }
        function gotoGroupDetail(id)
        {
            $state.go('app.message-groups.groups-setup.detail', {id: id});
        }
    }
})();