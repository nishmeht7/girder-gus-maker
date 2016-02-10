const eventEmitter = window.eventEmitter

app.controller('LevelDetailsCtrl', function ($scope, $state, data, user, SocialFactory) {
    if ( data ) {
        $scope.level = {
            _id: data._id,
            dateCreated: data.dateCreated,
            starCount: data.starCount,
            title: data.title
        };
        $scope.creator = data.creator;
        $scope.liked = (function() {
            if(user !== null) {
                console.log('liked',user.likedLevels.indexOf(data._id));
                return user.likedLevels.indexOf(data._id) !== -1;
            } else return false;
        })();
    }
    console.log('data',data);
    $scope.user = user;
    $scope.pending = false;
    var optimistic = false;
    var optimisticCache;
    var optimisticTimer;

    var serverStarToggle = function(action) {
        SocialFactory.levelLiker(data._id, action)
            .then(function(res) {
                if(optimisticCache !== undefined && action !== optimisticCache) {
                    var cacheAction = optimisticCache;
                    optimisticCache = undefined;
                    serverStarToggle(cacheAction);
                } else {
                    clearTimeout(optimisticTimer);
                    optimistic = false;
                    optimisticCache = undefined;
                    $scope.level.starCount = res.level.starCount;
                    $scope.creator.totalStars = res.creator.totalStars;
                    $scope.liked = res.user.likedLevels.indexOf(data._id) !== -1;
                    $scope.pending = false;
                }
            });
    }

    $scope.starLevel = function() {
        $scope.pending = true;
        optimisticTimer = setTimeout(function() {
            $scope.level.starCount++;
            $scope.creator.totalStars++;
            $scope.liked = true;
            $scope.pending = false;
            optimistic = true;
            $scope.$digest();
        }, 200);

        if(optimistic) {
            optimisticCache = 'likeLevel';
        } else {
            serverStarToggle('likeLevel');
        }
    }

    $scope.unstarLevel = function() {
        $scope.pending = true;
        optimisticTimer = setTimeout(function() {
            $scope.level.starCount--;
            $scope.creator.totalStars--;
            $scope.liked = false;
            $scope.pending = false;
            optimistic = true;
            $scope.$digest();
        }, 200);

        if(optimistic) {
            optimisticCache = 'unlikeLevel';
        } else {
            serverStarToggle('unlikeLevel');
        }
    }

	$scope.edit = function() {
		$state.go('createLevel', {levelId: $scope.level._id});
	}

    eventEmitter.on('what level to play', (data) => {
        var whatToPlay = ['notFound'];
        if ($scope.level._id) whatToPlay = ['levelId', $scope.level._id];
        eventEmitter.emit('play this level', whatToPlay);
    });
});
