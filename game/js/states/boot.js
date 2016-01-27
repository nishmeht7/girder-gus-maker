var STATE_BOOT = {};

STATE_BOOT.create = function() {

  // start game physics
  game.physics.startSystem( Phaser.Physics.ARCADE );

  game.state.start( "load" );

}
