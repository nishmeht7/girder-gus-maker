app.directive('levelThumbnail', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/levelthumbnail/levelthumbnail.html',
        controller: 'LevelThumbnailCtrl',
        scope: {
            level: '=',
            showCreator: '='
        }
    }
});