app.config(function($stateProvider) {
	$stateProvider.state('createLevel', {
		url: '/createLevel',
		templateUrl: 'js/states/createLevel/createLevel.html',
		controller: 'CreateLevelCtrl'
	});
});
