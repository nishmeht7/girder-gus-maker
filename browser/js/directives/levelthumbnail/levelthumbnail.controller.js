app.controller('LevelThumbnailCtrl', function($scope, $state, LevelsFactory) {
    $scope.deleteLevel = function() {
        LevelsFactory.delete($scope.level._id)
            .then(function(data) {
                console.log(data);
                $scope.$emit('level-deleted', data);
            })
    }
})