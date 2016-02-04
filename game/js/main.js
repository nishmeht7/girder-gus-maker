// startup options
var FULLSCREEN = false;
var WIDTH = FULLSCREEN ? window.innerWidth * window.devicePixelRatio : 800,
    HEIGHT = FULLSCREEN ? window.innerHeight * window.devicePixelRatio : 600;

function startGame( phaser ) {

  // initialize the game
  window.game = new phaser.Game( WIDTH, HEIGHT, Phaser.AUTO, 'game-container', undefined, undefined, false );

  // add states
  game.state.add( "boot", require( "./states/boot" )() );
  game.state.add( "load", require( "./states/load" )() );
  game.state.add( "game", require( "./states/game" )() );

  game.state.start( "boot" );

}

(function checkPhaserExists( phaser ) {
  if ( phaser ) {

    console.log( "Phaser runtime initialized, starting...")
    startGame( phaser );

  } else {
    setTimeout( function() { checkPhaserExists( window.Phaser ) }, 100 );
  }
})( window.Phaser );
