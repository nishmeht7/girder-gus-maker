app.controller('ProfileCtrl', function($scope, profile, UsersFactory) {
    var rowSize = 4;
    console.log(profile);
    var makeRows = function(levels) {
        return levels.reduce( function( levelMap, level ) {
            if ( levelMap[ levelMap.length - 1 ].length < rowSize ) {
                levelMap[ levelMap.length - 1 ].push( level );
            } else {
                levelMap.push( [level] );
            }
            return levelMap;
        }, [[]] );
    };
    var makePages = function(count) {
        var arr = [];
        for(var i = 1; i <= count; i++) {
            arr.push(i);
        }
        return arr;
    };

    $scope.user = profile.user;
    $scope.pages = {
        createdLevels: makePages(profile.createdLevels.pages),
        followingLevels: makePages(profile.followingLevels.pages),
        likedLevels: makePages(profile.likedLevels.pages),
        draftLevels: makePages(profile.draftLevels.pages)
    };
    $scope.currentPage = {
        createdLevels: 1,
        followingLevels: 1,
        likedLevels: 1,
        draftLevels: 1
    };

    $scope.createdLevels = makeRows(profile.createdLevels.levels);
    $scope.followingLevels = makeRows(profile.followingLevels.levels);
    $scope.likedLevels = makeRows(profile.likedLevels.levels);
    $scope.draftLevels = makeRows(profile.draftLevels.levels);

    $scope.loadCreatedPages = function(page) {
        UsersFactory.fetchProfileLevels('created', page)
            .then(function(data) {
                $scope.createdLevels = makeRows(data.levels);
                $scope.currentPage.createdLevels = page;
                $scope.pages.createdLevels = makePages(data.pages);
            })
    };
    $scope.loadFollowingPages = function(page) {
        UsersFactory.fetchProfileLevels('following', page)
            .then(function(data) {
                $scope.followingLevels = makeRows(data.levels);
                $scope.currentPage.followingLevels = page;
                $scope.pages.followingLevels = makePages(data.pages);
            })
    };
    $scope.loadLikedPages = function(page) {
        UsersFactory.fetchProfileLevels('liked', page)
            .then(function(data) {
                $scope.likedLevels = makeRows(data.levels);
                $scope.currentPage.likedLevels = page;
                $scope.pages.likedLevels = makePages(data.pages);
            })
    };
    $scope.loadDraftPages = function(page) {
        UsersFactory.fetchProfileLevels('drafts', page)
            .then(function(data) {
                $scope.draftLevels = makeRows(data.levels);
                $scope.currentPage.draftLevels = page;
            })
    };

    $scope.$on('level-deleted', function() {
        $scope.loadCreatedPages();
    });
})