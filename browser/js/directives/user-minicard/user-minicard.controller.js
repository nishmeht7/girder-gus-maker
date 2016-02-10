app.controller('UserMinicardCtrl', function($scope, SocialFactory) {
    $scope.followed = (function() {
        if($scope.user !== null) {
            return $scope.user.following.indexOf($scope.creator._id) !== -1;
        } else return false;
    })();
    $scope.pending = false;

    var optimistic = false;
    var optimisticCache;
    var optimisticTimer;

    var serverFollowToggle = function(action) {
        SocialFactory.userFollower($scope.creator._id, action)
            .then(function(res) {
                if(optimisticCache !== undefined && action !== optimisticCache) {
                    var cacheAction = optimisticCache;
                    optimisticCache = undefined;
                    serverFollowToggle(cacheAction);
                } else {
                    clearTimeout(optimisticTimer);
                    optimistic = false;
                    optimisticCache = undefined;
                    $scope.creator.totalFollowers = res.creator.totalFollowers;
                    $scope.followed = res.user.following.indexOf($scope.creator._id) !== -1;
                    $scope.pending = false;
                }
            });
    }

    $scope.followCreator = function() {
        $scope.pending = true;
        optimisticTimer = setTimeout(function() {
            $scope.followed = true;
            $scope.creator.totalFollowers++;
            $scope.pending = false;
            optimistic = true;
            $scope.$digest();
        }, 200);

        if(optimistic) {
            optimisticCache = 'followUser';
        } else {
            serverFollowToggle('followUser');
        }
    }

    $scope.unfollowCreator = function() {
        $scope.pending = true;
        optimisticTimer = setTimeout(function() {
            $scope.followed = false;
            $scope.creator.totalFollowers--;
            $scope.pending = false;
            optimistic = true;
            $scope.$digest();
        }, 200);

        if(optimistic) {
            optimisticCache = 'unfollowUser';
        } else {
            serverFollowToggle('unfollowUser');
        }
    }
});