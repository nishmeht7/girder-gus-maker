app.config(function($stateProvider) {
	$stateProvider.state('createLevel', {
		url: '/createLevel',
		params: {
			levelId: null
		},
		templateUrl: 'js/states/createLevel/createLevel.html',
		controller: 'CreateLevelCtrl'
	});
});
