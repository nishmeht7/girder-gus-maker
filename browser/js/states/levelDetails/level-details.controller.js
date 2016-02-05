const eventEmitter = window.eventEmitter

app.controller('LevelDetailsCtrl', function ($scope, data, $state) {
    $scope.level = data;
    $scope.liked = false;

    $scope.starLevel = function() {
        console.log( "starred" );

        $scope.level.starCount++;
        $scope.level.creator.totalStars++;
        $scope.liked = true;
    }

    $scope.unstarLevel = function() {
        console.log( "unstarred" );

        $scope.level.starCount--;
        $scope.level.creator.totalStars--;
        $scope.liked = false;
    }

	$scope.edit = function() {
		$state.go('createLevel', {levelId: $scope.level._id});
	}

    eventEmitter.on('what level to play', (data) => {
        console.log(data);
        eventEmitter.emit('play this level', ['levelId', $scope.level._id]);
    });
});
