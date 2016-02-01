app.config(function ($stateProvider) {

    $stateProvider.state('users', {
        url: '/users?name&email&totalStars&sort&by&limit&page',
        templateUrl: 'js/users/users.html',
        controller: 'UsersCtrl',
        resolve: {
            data: function(UsersFactory, $stateParams) {
                if($stateParams.limit === undefined) $stateParams.limit = 10;
                if($stateParams.sort === undefined) $stateParams.sort = 'totalStars';
                return UsersFactory.fetchAll($stateParams);
            }
        }
    });

});
