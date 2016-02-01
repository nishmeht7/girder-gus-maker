app.config(function ($stateProvider) {
    $stateProvider.state('levels', {
        url: '/levels',
        templateUrl: 'js/states/levels/levels.html',
		controller: 'LevelsCtrl',
        resolve: {
            levels: function(LevelsFactory) {
                return LevelsFactory.fetchAllWithCreators();
            }
        },
		link: function(s, e, a) {
			console.log('in all levels');
		}
    });
});
