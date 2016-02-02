const _ = require('lodash');
const eventEmitter = window.eventEmitter

app.controller('CreateLevelCtrl', function($scope) {
	console.log('i hate bugs');
	$scope.toolArr = {
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
    console.log('requesting parsed tile map...')
    eventEmitter.emit('request parsed tile map', '');
  }

  eventEmitter.on('send parsed tile map', (parsedTileMap) => {
    console.log('recieved.')
    console.dir(parsedTileMap);
  })
});
