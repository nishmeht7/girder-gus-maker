app.config(function ($stateProvider) {

    $stateProvider.state('users', {
        url: '/users',
        templateUrl: 'js/states/users/users.html',
        controller: 'UsersCtrl',
        resolve: {
            users: function(UsersFactory) {
                return UsersFactory.fetchAllWithLevels();
            }
        }
    });

});
