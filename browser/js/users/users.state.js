app.config(function ($stateProvider) {

    $stateProvider.state('users', {
        url: '/users',
        templateUrl: 'js/users/users.html',
        controller: 'UsersCtrl',
        resolve: {
            users: function(UsersFactory) {
                return UsersFactory.fetchAllWithLevels();
            }
        }
    });

});
