const eventEmitter = window.eventEmitter

<<<<<<< HEAD
app.controller('LevelDetailsCtrl', function ($scope, data, $state) {
    $scope.level = data;
    $scope.liked = false;
=======
app.controller('LevelDetailsCtrl', function ($scope, data, user, SocialFactory) {
    $scope.level = {
        _id: data._id,
        dateCreated: data.dateCreated,
        starCount: data.starCount,
        title: data.title
    };
    $scope.creator = data.creator;
    console.log('data',data);
    $scope.user = user;
    $scope.liked = (function() {
        if(user !== null) {
            console.log('liked',user.likedLevels.indexOf(data._id));
            return user.likedLevels.indexOf(data._id) !== -1;
        } else return false;
    })();
    $scope.pending = false;
>>>>>>> master

    $scope.starLevel = function() {
        if(user !== null) {
            $scope.pending = true;
            SocialFactory.levelLiker(data._id,'likeLevel')
                .then(function(res) {
                    console.log(res);
                    $scope.level.starCount = res.level.starCount;
                    $scope.creator.totalStars = res.creator.totalStars;
                    $scope.liked = res.user.likedLevels.indexOf(data._id) !== -1;
                    $scope.pending = false;
                });
        }
    }

    $scope.unstarLevel = function() {
        if(user !== null) {
            $scope.pending = true;
            SocialFactory.levelLiker(data._id,'unlikeLevel')
                .then(function(res) {
                    console.log(res);
                    $scope.level.starCount = res.level.starCount;
                    $scope.creator.totalStars = res.creator.totalStars;
                    $scope.liked = res.user.likedLevels.indexOf(data._id) !== -1;
                    $scope.pending = false;
                });
        }
    }

	$scope.edit = function() {
		$state.go('createLevel', {levelId: $scope.level._id});
	}

    eventEmitter.on('what level to play', (data) => {
        console.log(data);
        eventEmitter.emit('play this level', ['levelId', $scope.level._id]);
    });
});
