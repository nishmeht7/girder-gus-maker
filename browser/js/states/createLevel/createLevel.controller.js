const _ = require('lodash');
const eventEmitter = window.eventEmitter

app.controller('CreateLevelCtrl', function($scope) {
	$scope.toolArr = {
		'Eraser' : {
			img : '/assets/images/eraser.png',
      tile: null
		},
    'Red Brick' : {
			img : '/assets/images/brick_red.png',
      tile: 'BrickRed'
		},
		'Black Brick' : {
			img : '/assets/images/brick_black.png',
      tile: 'BrickBlack'
		},
		'Break Brick' : {
			img : '/assets/images/brick_break.png',
      tile: 'BrickBreak'
		},
		'Tool' : {
			img : '/assets/images/tool.png',
      tile: 'Tool'
		}
	}

  $scope.changeActiveTool = function(tile) {
    console.log('changing active tool...')
    eventEmitter.emit('change active tool', tile)
  }

  $scope.requestParsedTileMap = () => {
    console.log('requesting tile map...')
    eventEmitter.emit('request tile map', '');
  }

  eventEmitter.on('send tile map', (parsedTileMap) => {
    console.log('recieved.')
    console.dir(parsedTileMap);
  })
});
