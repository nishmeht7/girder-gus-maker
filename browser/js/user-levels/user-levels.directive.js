app.directive('userlevels', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/user-levels/user-levels.html',
        controller: 'UserLevelsCtrl',
        scope: {
            levels: '='
        }
    }
})