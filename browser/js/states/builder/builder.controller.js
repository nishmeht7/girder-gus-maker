app.controller('BuilderCtrl', function($scope, $state) {
	console.log('working builder ctrl');
	$scope.goToCreate = function() {
		console.log("work bitch");
		$state.go('createLevel');
	}
});
