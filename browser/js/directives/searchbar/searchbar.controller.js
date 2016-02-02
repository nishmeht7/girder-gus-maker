app.controller('SearchbarCtrl', function($scope, $state) {
    console.log($scope.sorts);
    $scope.sort = $scope.sorts[0];
    $scope.searchType = $scope.searchTypes[0];
    $scope.by = 'desc';
    $scope.search = function() {
        var type = $scope.searchbar.type.$modelValue.value;
        var params = {
            sort: $scope.searchbar.order.$modelValue.value,
            by: $scope.searchbar.orderBy.$modelValue,
            page: undefined,
            limit: undefined
        };
        if(type === 'title') {
            params.title = $scope.searchbar.query.$modelValue;
            params.creator = undefined;
        } else if(type === 'creator') {
            params.creator = $scope.searchbar.query.$modelValue;
            params.title = undefined;
        }

        $state.go('levels',params, { reload: true });
    }
})