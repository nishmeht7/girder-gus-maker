app.controller('LevelsCtrl', function ($scope, AuthService, $state, data, $stateParams) {
	$scope.levels = data.results;
    $scope.pages = [];
    for(var i = 1; i <= data.pages; i++) {
        $scope.pages.push(i);
    }
    $scope.sorts = [{ title: 'Date Created', value: 'dateCreate'},{ title: 'Title', value: 'title' },{ title: 'Star Count', value: 'starCount'}];
    $scope.searchTypes = [{ title: 'Title', value: 'title'},{title: 'Creator', value: 'creator'}];
    $scope.currentPage = $stateParams.page !== undefined ? parseInt($stateParams.page) : 1;
    $scope.params = $stateParams;

    $scope.toPage = function(page) {
        var params = $stateParams;
        params.page = page;
        if(page > 0 && page <= $scope.pages.length && page !== $scope.currentPage) {
            $state.go('.', params, { reload: true });
        }
    };
});
