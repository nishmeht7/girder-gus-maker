const _ = require('lodash');
const eventEmitter = window.eventEmitter

app.controller('CreateLevelCtrl', function($scope, CreateLevelFactory) {
	var nextMapUse = null;
	var unparsedLevelArr = null;
	var parsedLevelArr = [];

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
	'Spike': {
		img : '/assets/images/spike.png',
		tile: 'Spike'
	},
	'Tool' : {
		img : '/assets/images/tool.png',
		tile: 'Tool'
	}
	}

	$scope.activeToolImg = $scope.toolArr['Red Brick'].img;

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

	eventEmitter.on('game ended', function(data) {
		console.log(data);
		$scope.beaten = true;
		$scope.beatenLevel = parsedLevelArr;
		$scope.$digest();
	});

	eventEmitter.on('send tile map', (mapArr) => {
		if(nextMapUse === 'log') {
			console.log('recieved.');
			console.dir(mapArr);
		} else if (nextMapUse === 'switchToGame') {
			console.log('ready to switch');
			parsedLevelArr = mapArr[0];
			console.log(parsedLevelArr);
			console.log("look above");
			unparsedLevelArr = mapArr[1];
			$scope.testing = true;
		}
	});

	eventEmitter.on('I need both the maps!', function() {
		eventEmitter.emit('found maps!', [unparsedLevelArr, parsedLevelArr]);
	});

	$scope.getScreenshot = function() {
		eventEmitter.emit('request screenshot');
	}

	$scope.submitBeatenLevel = function(levelArrayBeaten, levelTitle, girdersAllowed, skyColor) {
		console.log(levelArrayBeaten, levelTitle, girdersAllowed, skyColor);
		CreateLevelFactory.submitLevel(levelArrayBeaten, levelTitle, girdersAllowed, skyColor);
	}

	$scope.testTesting = function() {
		window.game.destroy();

		(function checkGameDestroyed() {
			if ( window.game.state === null ) {

				window.game = null;
				nextMapUse = 'switchToGame';
				$scope.activeToolImg = $scope.toolArr['Red Brick'].img;
				if(!$scope.testing) {
					eventEmitter.emit('request tile map', '');
				} else {
					$scope.testing = !$scope.testing;
					$scope.beatenLevel = null;
					$scope.beaten = false;
				}

			} else {
				setTimeout( checkGameDestroyed, 100 );
			}
		})()
	}

	eventEmitter.on('send screenshot', (screenshot) => {
		console.log('screenshot');
		console.log(screenshot);
	})

	eventEmitter.on('what level to play', (data) => {
		console.log(data);
		if(parsedLevelArr) {
			eventEmitter.emit('play this level', ['levelArr', {
				levelArr: parsedLevelArr,
				skyColor: $scope.skyColor,
				girdersAllowed: $scope.girdersAllowed
			}]);
			console.log('found a parsed level arr');
		} else {
			console.log(parsedLevelArr);
		}
	});
});
