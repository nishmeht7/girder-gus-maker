app.factory('CreateLevelFactory', function ($http) {
	var factory = {};
	factory.submitLevel = function() {
		console.log('submitting level');
	};
	return factory;
});
