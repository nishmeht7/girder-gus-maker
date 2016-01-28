app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: function($state) {
            console.log('here');
            $state.go('users');
        }
    });
});