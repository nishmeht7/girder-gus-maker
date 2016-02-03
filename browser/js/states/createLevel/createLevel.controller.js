const _ = require('lodash');
const eventEmitter = window.eventEmitter

app.controller('CreateLevelCtrl', function($scope) {
	var nextMapUse = null;
	var levelArr = null;

	$scope.testing = false;

	$scope.toolArr = {
		'Eraser' : {
			img : '/assets/images/eraser.png',
	tile: null
		},
	'Gus' : {
		img : '/assets/images/gus-static.png',
	tile: 'Gus'
	},
	'Red Brick' : {
		img : '/assets/images/brick_red.png',
	tile: 'RedBrickBlock'
	},
	'Black Brick' : {
		img : '/assets/images/brick_black.png',
		tile: 'BlackBrickBlock'
	},
	'Break Brick' : {
		img : '/assets/images/brick_break.png',
		tile: 'BreakBrickBlock'
	},
	'Tool' : {
		img : '/assets/images/tool.png',
		tile: 'Tool'
	}
	}

	$scope.changeActiveTool = function(tool) {
		console.log('changing active tool...')
			eventEmitter.emit('change active tool', tool.tile)
			$scope.activeToolImg = tool.img;
	}

	$scope.requestParsedTileMap = () => {
		nextMapUse = 'log';
		console.log('requesting tile map...');
		eventEmitter.emit('request tile map', '');
	}

	eventEmitter.on('send tile map', (parsedTileMap) => {
		if(nextMapUse === 'log') {
			console.log('recieved.');
			console.dir(parsedTileMap);
		} else if (nextMapUse === 'switchToGame') {
			console.log('ready to switch');
			levelArr = parsedTileMap;
			$scope.testing = true;
		}
	});

	$scope.getScreenshot = function() {
		eventEmitter.emit('request screenshot');
	}

	$scope.testTesting = function() {
		window.game = null;
		nextMapUse = 'switchToGame';
		if(!$scope.testing) {
			eventEmitter.emit('request tile map', '');
		} else {
			$scope.testing = !$scope.testing;
		}
	}

	eventEmitter.on('send screenshot', (screenshot) => {
		console.log('screenshot');
		console.log(screenshot);
	})

	eventEmitter.on('what level to play', (data) => {
		console.log(data);
		if(levelArr) {
			eventEmitter.emit('play this level', ['levelArr', levelArr]);
		} else {
			console.log(levelArr);
		}
	});
});
