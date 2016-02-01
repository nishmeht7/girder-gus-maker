app.controller('LevelsCtrl', function ($scope, AuthService, $state, data, $stateParams) {
	$scope.levels = data.results;
    $scope.pages = [];
    for(var i = 1; i <= data.pages; i++) {
        $scope.pages.push(i);
    }
    $scope.orderBy = [{ title: 'Date Created', value: 'dateCreate'},{ title: 'Creator', value: 'creator'},{ title: 'Star Count', value: 'starCount'}]
    $scope.currentPage = $stateParams.page !== undefined ? parseInt($stateParams.page) : 1;
    console.log('currentPage',$scope.currentPage)

    $scope.toPage = function(page) {
        var params = $stateParams;
        params.page = page;
        console.log("page",page,'currentPage',$scope.currentPage,'params',params);
        console.log('page > 0',page > 0,'page <= $scope.pages.length',page <= $scope.pages.length,'page !== $scope.currentPage',page !== $scope.currentPage);
        if(page > 0 && page <= $scope.pages.length && page !== $scope.currentPage) {
            console.log('go');
            $state.go('.', params, { reload: true });
        }
    };
});
