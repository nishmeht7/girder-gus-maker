var LevelGenerator = require( "../generator" );

function initLoadState() {

  var state = {};
  var game = window.game;
  var generator;

  state.preload = function () {

    console.log( "Loading assets..." );

    game.load.image('BrickBlack', '/assets/images/brick_black.png');
    game.load.image('BrickBreak', '/assets/images/brick_break.png');
    game.load.image('BrickRed', '/assets/images/brick_red.png');
    game.load.image('Girder', '/assets/images/girder.png');
    game.load.image('Tool', '/assets/images/tool.png');
    game.load.spritesheet('Gus', '/assets/images/gus.png', 32, 32);

    console.log( "Loading level data..." );

    var level = {};

    generator = new LevelGenerator( level );

    console.log( "Done loading" );

  }

  state.create = function () {

      game.world.setBounds( -400, -300, 800, 600 );

      // set background color
      game.stage.setBackgroundColor( generator.getSkyColor() );

      // generate the rest of the fucking level
      generator.parseObjects();

      // start game state
      game.state.start( "game" );

  }

  return state;

}

module.exports = initLoadState;