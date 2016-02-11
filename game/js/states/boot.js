var COLLISION_GROUPS = require( "../consts/collisionGroups" );

function initBootState() {

  var state = {};
  var game = window.game;

  state.preload = function () {

    game.load.spritesheet('Gus', '/assets/images/gus.png', 32, 32);

  }

  state.create = function() {

    // use advanced timing engine
    game.time.advancedTiming = true;

    game.world.setBounds( -400, -300, 800, 600 );
    var loadText = game.add.text( 0, 32, "Checking components...", { font: "12pt \"Arial\", sans-serif", fill: "white" })
    loadText.anchor = { x: 0.5, y: 0 };
    var loadGus = game.add.sprite( -16, -16, "Gus" );

    // start game physics
    for( var attempts = 0; !game.physics.p2; attempts++ ) {

      if ( attempts >= 10 ) {
        loadText.text = "An error occurred. Please reload the page.";
        throw new Error( "Starting physics engine failed after 10 retries" );
      }


      console.log( "Initializing physics..." );
      game.physics.startSystem( Phaser.Physics.P2JS );
      //game.physics.p2.setBoundsToWorld();

      // do a short physics test
      if ( !game.physics.p2 || typeof game.physics.p2.getBodies !== "function" ) {
        console.error( "Physics engine was not initialized properly, retrying..." );
        game.physics.destroy();
      } else {
        // add body test
        var testBody = game.physics.p2.createBody( 0, 0, 1, true, [[-16,-16],[-16,16],[16,16],[16,-16]] );
        console.dir( testBody );

        var bodies = game.physics.p2.getBodies();
        if ( !Array.isArray( bodies ) || bodies.length === 0 || bodies.indexOf( testBody ) === -1 ) {
          console.error( "Could not properly add a body to the physics engine, retrying..." );
          game.physics.destroy();
        } else {
          // collisionGroup initialization

          console.log( "Creating collision groups..." );
          console.log( "collision groups are ", COLLISION_GROUPS );
          for ( var key in COLLISION_GROUPS ) {
            COLLISION_GROUPS[key] = game.physics.p2.createCollisionGroup();
          }

          if ( game.physics.p2.collisionGroups.length === 0 ) {
            console.error( "Failed to initialize collision groups..." );
            game.physics.destroy();
          }

        }
      }

    }

    console.log( "Physics engine initialized successfully" );

    game.physics.p2.setImpactEvents( true );

    console.log( "Bootstrap complete" );

    game.state.start( "load" );

  }

  return state;

}

module.exports = initBootState;
