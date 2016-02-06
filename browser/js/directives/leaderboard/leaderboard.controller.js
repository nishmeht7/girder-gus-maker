app.controller('LeaderboardCtrl', function($scope) {
    console.log($scope.select);
    $scope.list = $scope.list.map(function(item) {
        console.log(item);
        console.log($scope.select);
        return {
            _id: item._id,
            name: item.name,
            topField: item[$scope.select]
        };
    });
    console.log($scope.list);
});