
function initLoadState() {

  var state = {};

  state.preload = function () {
      game.load.image('BrickBlack', 'game/images/brick_black.png');
      game.load.image('BrickBreak', 'game/images/brick_break.png');
      game.load.image('BrickRed', 'game/images/brick_red.png');
      game.load.image('Girder', 'game/images/girder.png');
      game.load.image('Tool', 'game/images/tool.png');
      game.load.spritesheet('Gus', 'game/images/gus.png', 32, 32);
  }

  state.create = function () {

      // set background color
      game.stage.setBackgroundColor( COLORS.BACKGROUND_SKY );

      // start game state
      game.state.start( "game" );

  }

  return state;

}
