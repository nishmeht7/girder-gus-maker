var _ = require('lodash');
app.controller('CreateLevelCtrl', function($scope) {
	console.log('i hate bugs');
	$scope.toolArr = {
		'Red Brick' : {
			img : '/assets/images/brick_red.png'
		},
		'Black Brick' : {
			img : '/assets/images/brick_black.png'
		},
		'Break Brick' : {
			img : '/assets/images/brick_break.png'
		},
		'Tool' : {
			img : '/assets/images/tool.png'
		}
	}
});
