app.config(function ($stateProvider) {
    $stateProvider.state('alllevels', {
        url: '/alllevels',
        templateUrl: 'js/allLevels/allLevels.html',
		controller: 'AllLevelsCtrl',
		link: function(s, e, a) {
			console.log('in all levels');
		}
    });
});
