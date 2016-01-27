// startup options
var   FULLSCREEN = false;
var   WIDTH   = FULLSCREEN ? window.innerWidth * window.devicePixelRatio : 800,
      HEIGHT  = FULLSCREEN ? window.innerHeight * window.devicePixelRatio : 600;

// initialize the game
var   game    = new Phaser.Game( WIDTH, HEIGHT, Phaser.AUTO, 'gameContainer' );

// add states
game.state.add( "boot", initBootState() );
game.state.add( "load", initLoadState() );
game.state.add( "game", initGameState() );

game.state.start( "boot" );