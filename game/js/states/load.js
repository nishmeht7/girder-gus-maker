function initLoadState() {

  var state = {};
  var game = window.game;

  state.preload = function () {

    console.log( "Loading assets..." );

    game.load.image('BrickBlack', '/assets/images/brick_black.png');
    game.load.image('BrickBreak', '/assets/images/brick_break.png');
    game.load.image('BrickRed', '/assets/images/brick_red.png');
    game.load.image('Girder', '/assets/images/girder.png');
    game.load.image('Tool', '/assets/images/tool.png');
    game.load.spritesheet('Gus', '/assets/images/gus.png', 32, 32);

    console.log( "Done loading" );

  }

  state.create = function () {

      game.world.setBounds( -400, -300, 800, 600 ); // fullscreen???

      // set background color
      game.stage.setBackgroundColor( "#4428BC" );

      game.map = game.add.tilemap( null, 32, 32, 60, 60 );
      game.map.addTilesetImage( "BrickRed", "BrickRed" );
      game.map.layer1 = game.map.create( "Blocks", 60, 60, 32, 32 );
      game.map.layer1.debug = true;
      game.map.random( 0, 0, 60, 60, game.map.layer1 );
      //game.map.layer1.resizeWorld();

      // start game state
      game.state.start( "game" );

  }

  return state;

}

module.exports = initLoadState;