const eventEmitter = window.eventEmitter

app.controller('LevelDetailsCtrl', function ($scope, data, user, LevelsFactory) {
    $scope.level = data;
    $scope.user = user;
    $scope.liked = (function() {
        if(user !== null) {
            console.log('liked',user.likedLevels.indexOf(data._id));
            return user.likedLevels.indexOf(data._id) !== -1;
        } else return false;
    })()

    $scope.starLevel = function() {
        if(user !== null) {
            LevelsFactory.levelLiker(data._id,'likeLevel')
                .then(function(res) {
                    console.log(res);
                    $scope.level.starCount = res.level.starCount;
                    $scope.level.creator.totalStars = res.level.creator.totalStars;
                    $scope.liked = res.user.likedLevels.indexOf(data._id) !== -1;
                });
        }
    }

    $scope.unstarLevel = function() {
        if(user !== null) {
            LevelsFactory.levelLiker(data._id,'unlikeLevel')
                .then(function(res) {
                    console.log(res);
                    $scope.level.starCount = res.level.starCount;
                    $scope.level.creator.totalStars = res.level.creator.totalStars;
                    $scope.liked = res.user.likedLevels.indexOf(data._id) !== -1;
                });
        }
    }

    eventEmitter.on('what level to play', (data) => {
        console.log(data);
        eventEmitter.emit('play this level', ['levelId', $scope.level._id]);
    });
});
