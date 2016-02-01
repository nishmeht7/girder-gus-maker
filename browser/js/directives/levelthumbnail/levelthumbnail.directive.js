app.directive('levelThumbnail', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/directives/levelthumbnail/levelthumbnail.html',
        controller: 'LevelThumbnailCtrl',
        scope: {
            level: '=',
            showCreator: '='
        }
    }
});
