app.controller('UsersCtrl', function($scope, data) {
    $scope.users = data.results;
    $scope.pages = data.pages;
})