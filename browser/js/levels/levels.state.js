app.config(function ($stateProvider) {
    $stateProvider.state('levels', {
        url: '/levels?title&starCount&sort&by&limit&page',
        templateUrl: 'js/levels/levels.html',
		controller: 'LevelsCtrl',
        resolve: {
            data: function(LevelsFactory, $stateParams) {
                if($stateParams.limit === undefined) $stateParams.limit = 20;
                if($stateParams.sort === undefined) $stateParams.sort = 'dateCreate';
                return LevelsFactory.fetchAll($stateParams);
            }
        },
		link: function(s, e, a) {
			console.log('in all levels');
		}
    });
});
