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

var COLLISION_GROUPS = {};
COLLISION_GROUPS.BLOCK_SOLID =    true;
COLLISION_GROUPS.BLOCK_ROTATE =   true;
COLLISION_GROUPS.PLAYER_SOLID =   true;
COLLISION_GROUPS.PLAYER_SENSOR =  true;

var COLORS = {};
COLORS.BACKGROUND_SKY = "#4428BC";

var EPSILON = 0.000001;
var TAU = Math.PI * 2;
function Gus(x, y) {

    this.speed = 250;         // walk speed
    this.gravity = 1000;      // gravity speed
    this.hopStrength = 60;   // strength of gus's walk cycle hops

    this.rotation = 0;        // internal rotation counter
    this.prevRotation = 0;    // previous rotation

    this.rotating = false;    // is gus rotating?
    this.canRotate = true;    // can gus rotate?
    this.targetRotation = 0;  // target rotation of this flip

    // create a sprite object and set its anchor
    this.sprite = game.add.sprite(x, y, 'Gus');

    // attach our sprite to the physics engine
    game.physics.p2.enable( this.sprite, true );
    this.sprite.body.fixedRotation = true;
    this.sprite.body.setCollisionGroup( COLLISION_GROUPS.PLAYER_SOLID );
    this.sprite.body.collides( [ COLLISION_GROUPS.BLOCK_SOLID, COLLISION_GROUPS.BLOCK_ROTATE ] );

    // create gus's rotation sensor
    this.rotationSensor = this.sprite.body.addRectangle( this.sprite.width + 2, 24 );
    this.sprite.body.setCollisionGroup( COLLISION_GROUPS.PLAYER_SENSOR, this.rotationSensor );
    this.sprite.body.collides( [ COLLISION_GROUPS.BLOCK_ROTATE ], Gus.prototype.touchesWall, this, this.rotationSensor );
    this.sprite.body.onBeginContact.add( Gus.prototype.touchesWall, this );
    //this.sprite.body.collides( [ COLLISION_GROUPS.BLOCK_ROTATE ], Gus.prototype.touchesWall, this );

    // add animations
    this.sprite.animations.add('stand', [0], 10, true);
    this.sprite.animations.add('walk', [1,2], 10, true);
    
}

function saneVec( vec ) {
  var x = Math.abs( vec[0] ) < EPSILON ? 0 : vec[0];
  var y = Math.abs( vec[1] ) < EPSILON ? 0 : vec[1];
  return p2.vec2.fromValues( x, y );
}

function dot( vec1, vec2 ) {
  return (vec1[0] * vec2[0]) + (vec1[1] * vec2[1]);
}

function clampAngleToTau( ang ) {

  ang = ang % TAU;
  if ( ang < 0 ) ang = TAU - ang;
  return ang;

}

function angWithin( ang, min, max ) {

  ang = clampAngleToTau( ang );
  min = clampAngleToTau( min );
  max = clampAngleToTau( max );

  if ( min > max ) return ang >= min || ang <= max;
  else return ang >= min && ang <= max;

}

Gus.prototype.touchesWall = function( gus, other, sensor, shape, contact ) {

  if ( !this.canRotate ) return;
  if ( sensor !== this.rotationSensor ) return;

  var leftVec = p2.vec2.fromValues( -Math.cos( this.rotation ), -Math.sin( this.rotation ) );
  var d = dot( saneVec( leftVec ), saneVec( contact[0].normalA ) );
  if ( contact[0].bodyB === gus.data ) d *= -1;

  if ( d > 1 - EPSILON ) this.rotate( "left" );
  else if ( d < -1 + EPSILON ) this.rotate( "right" );

}

Gus.prototype.isTouching = function( side ) {
  // get the vector to check
  var dirVec = null;
  if ( side === "left" ) dirVec = p2.vec2.fromValues( -Math.cos( this.rotation ), -Math.sin( this.rotation ) );
  if ( side === "right" ) dirVec = p2.vec2.fromValues( Math.cos( this.rotation ), Math.sin( this.rotation ) );
  if ( side === "down" ) dirVec = p2.vec2.fromValues( -Math.sin( this.rotation ), Math.cos( this.rotation ) );
  if ( side === "up" ) dirVec = p2.vec2.fromValues( Math.sin( this.rotation ), -Math.cos( this.rotation ) );

  // loop throuhg all contacts
  for ( var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; ++i ) {
    var contact = game.physics.p2.world.narrowphase.contactEquations[i];

    // check to see if the player has been affected
    if ( contact.bodyA === this.sprite.body.data || contact.bodyB === this.sprite.body.data ) {

      // if the dot of the normal is 1, the player is perpendicular to the collision
      var d = dot( saneVec( dirVec ), saneVec( contact.normalA ) );
      if ( contact.bodyA === this.sprite.body.data ) d *= -1;
      if ( d > 1 - EPSILON && contact.bodyA !== null && contact.bodyB !== null ) {
        return true;
      }

    }
  }
}

Gus.prototype.checkForRotation = function( dir ) {

  if ( dir === "left" && this.isTouching( "left" ) ) {
    this.rotate( "left" );
  } else if ( dir === "right" && this.isTouching( "right" ) ) {
    this.rotate( "right" );
  }

}

Gus.prototype.rotate = function( dir ) {

  if ( this.rotating ) return;

  // find the angle to rotate by
  if ( dir === "left" ) {
    var rot = -Math.PI / 2;
  } else {
    var rot = Math.PI / 2;
  }

  // change values
  this.targetRotation -= rot;
  this.rotating = true;
  this.canRotate = false;
  this.sprite.body.enabled = false;

}

Gus.prototype.finishRotation = function() {

  // keep our rotation between tau and 0
  if ( this.rotation < 0 ) this.rotation = TAU + this.rotation;

  // set gravity relative to our new axis
  this.sprite.body.gravity.y = Math.floor( Math.cos( this.rotation ) * this.gravity );
  this.sprite.body.gravity.x = Math.floor( Math.sin( this.rotation ) * -this.gravity );

  // change rotation
  this.sprite.rotation = this.rotation;
  this.sprite.body.rotation = this.rotation;

  // reset state after rotation
  this.sprite.body.enabled = true;
  this.rotating = false;
  delete this.rotateTween;

}

Gus.prototype.applyGravity = function() {

  if ( !this.isTouching( "down" ) ) {

    this.sprite.body.velocity.x += Math.floor( Math.sin( this.rotation ) * ( -this.gravity * 0.016 ) );
    this.sprite.body.velocity.y += Math.floor( Math.cos( this.rotation ) * ( this.gravity * 0.016 ) );

  }

}

Gus.prototype.walk = function( dir ) {

  if ( dir === "left" ) {
    var intendedVelocity = -this.speed;
    this.sprite.scale.x = -1;
  } else {
    var intendedVelocity = this.speed;
    this.sprite.scale.x = 1;
  }

  var cosine = Math.cos( this.rotation );
  if ( Math.abs( cosine ) > EPSILON ) {
    this.sprite.body.velocity.x = cosine * intendedVelocity;
    if ( this.isTouching( "down" ) ) this.sprite.body.velocity.y = cosine * -this.hopStrength;
  } else {
    var sine = Math.sin( this.rotation );
    this.sprite.body.velocity.y = sine * intendedVelocity;
    if ( this.isTouching( "down" ) ) this.sprite.body.velocity.x = sine * this.hopStrength;
  }

  this.sprite.animations.play( 'walk' );
  this.canRotate = true;

}

Gus.prototype.stop = function() {

  this.sprite.animations.play( 'stand' );

}

Gus.prototype.update = function() {

  // clear horizontal movement
  if ( Math.abs( Math.cos( this.rotation ) ) > EPSILON ) this.sprite.body.velocity.x = 0;
  else this.sprite.body.velocity.y = 0;

  // check to see if we're rotating
  if ( this.rotating ) {

    // stop all movement
    this.stop();
    this.sprite.body.velocity.y = 0;
    this.sprite.body.velocity.x = 0;

    // create a rotate tween
    if ( this.rotateTween === undefined ) {
      this.rotateTween = game.add.tween( this.sprite ).to( { rotation: this.targetRotation }, 300, Phaser.Easing.Default, true )
      .onComplete.add( function( gus, tween ) {
        this.rotation = this.targetRotation % ( TAU );
        this.finishRotation();
          // set gravity relative to our new axis
      }, this );
    }

    // change rotation
  } else {

    // do gravity
    this.applyGravity();

    // check for input
    if ( cursors.left.isDown ) {
      //if ( this.canRotate ) this.checkForRotation( "left" );
      this.walk( "left" );
    } else if ( cursors.right.isDown ) {
      //if ( this.canRotate ) this.checkForRotation( "right" );
      this.walk( "right" );
    } else {
      this.stop();
    }

  }

}
function initBootState() {

  var state = {};

  state.create = function() {

    console.log( "Initializing physics..." );

    // start game physics
    game.physics.startSystem( Phaser.Physics.P2JS );
    game.physics.p2.setImpactEvents( true );

    console.log( "Creating collision groups..." );

    for ( var key in COLLISION_GROUPS ) {
      COLLISION_GROUPS[key] = game.physics.p2.createCollisionGroup();
    }

    console.log( "Bootstrap complete" );

    game.state.start( "load" );

  }

  return state;

}

function initGameState() {

  var state = {};
  var gus, blocks;

  state.preload = function () {

  }

  state.create = function () {

    console.log( "Starting world..." );

    game.add.plugin( Phaser.Plugin.Debug );
    game.world.setBounds( -400, -300, 800, 600 );
    game.physics.p2.setBoundsToWorld();
    //game.physics.arcade.setBounds( -10000, -10000, 20000, 20000 );

    console.log( "Creating Gus..." );

    gus = new Gus( 0, 0 );

    console.log( "Creating blocks..." );

    blocks = game.add.group();
    blocks.enableBody = true;
    blocks.physicsBodyType = Phaser.Physics.P2JS;

    for( var i = 0; i < 10; ++i ) {
      var newBlock = blocks.create( -128 + (32 * i), 128, 'BrickRed' );
      // newBlock.body.static = true;
      
      //game.physics.p2.enable( newBlock, true );
      newBlock.body.setRectangle( 32, 32 );
      newBlock.body.setCollisionGroup( COLLISION_GROUPS.BLOCK_ROTATE );
      newBlock.body.collides( [ COLLISION_GROUPS.PLAYER_SOLID, COLLISION_GROUPS.PLAYER_SENSOR ] );
      newBlock.body.static = true;
    }

    for( var i = 0; i < 10; ++i ) {
      var newBlock = blocks.create( -160, 128 - (32 * i), 'BrickRed' );
      newBlock.body.setRectangle( 32, 32 );
      newBlock.body.setCollisionGroup( COLLISION_GROUPS.BLOCK_ROTATE );
      newBlock.body.collides( [ COLLISION_GROUPS.PLAYER_SOLID, COLLISION_GROUPS.PLAYER_SENSOR ] );
      newBlock.body.static = true;
    }

    for( var i = 0; i < 10; ++i ) {
      var newBlock = blocks.create( 192, 128 - (32 * i), 'BrickRed' );
      newBlock.body.setRectangle( 32, 32 );
      newBlock.body.setCollisionGroup( COLLISION_GROUPS.BLOCK_ROTATE );
      newBlock.body.collides( [ COLLISION_GROUPS.PLAYER_SOLID, COLLISION_GROUPS.PLAYER_SENSOR ] );
      newBlock.body.static = true;
    }

    for( var i = 0; i < 10; ++i ) {
      var newBlock = blocks.create( -256, 128 - (32 * i), 'BrickRed' );
      newBlock.body.setRectangle( 32, 32 );
      newBlock.body.setCollisionGroup( COLLISION_GROUPS.BLOCK_ROTATE );
      newBlock.body.collides( [ COLLISION_GROUPS.PLAYER_SOLID, COLLISION_GROUPS.PLAYER_SENSOR ] );
      newBlock.body.static = true;
    }

    console.log( "Binding to keys..." );

    cursors = game.input.keyboard.createCursorKeys();

  }

  state.update = function () {

    //game.physics.arcade.collide( gus.sprite, blocks );

    gus.update();

    game.camera.displayObject.pivot.x = gus.sprite.position.x;
    game.camera.displayObject.pivot.y = gus.sprite.position.y;
    game.camera.displayObject.rotation = (Math.PI * 2) - gus.sprite.rotation;
    //game.world.rotation = (Math.PI * 2) - gus.rotation;
    //game.physics.arcade.collide( gus.sprite, blocks );

  }

  return state;

}


function initLoadState() {

  var state = {};

  state.preload = function () {

    console.log( "Loading assets..." );

    game.load.image('BrickBlack', 'public/assets/images/brick_black.png');
    game.load.image('BrickBreak', 'public/assets/images/brick_break.png');
    game.load.image('BrickRed', 'public/assets/images/brick_red.png');
    game.load.image('Girder', 'public/assets/images/girder.png');
    game.load.image('Tool', 'public/assets/images/tool.png');
    game.load.spritesheet('Gus', 'public/assets/images/gus.png', 32, 32);

    console.log( "Done loading" );

  }

  state.create = function () {

      // set background color
      game.stage.setBackgroundColor( "#4428BC" );

      // start game state
      game.state.start( "game" );

  }

  return state;

}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJjb25zdHMvY29sbGlzaW9uR3JvdXBzLmpzIiwiY29uc3RzL2NvbG9ycy5qcyIsImNvbnN0cy9pbmRleC5qcyIsIm9iamVjdHMvZ3VzLmpzIiwic3RhdGVzL2Jvb3QuanMiLCJzdGF0ZXMvZ2FtZS5qcyIsInN0YXRlcy9sb2FkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUNGQTtBQUNBO0FBQ0E7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnaXJkZXItZ3VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gc3RhcnR1cCBvcHRpb25zXG52YXIgICBGVUxMU0NSRUVOID0gZmFsc2U7XG52YXIgICBXSURUSCAgID0gRlVMTFNDUkVFTiA/IHdpbmRvdy5pbm5lcldpZHRoICogd2luZG93LmRldmljZVBpeGVsUmF0aW8gOiA4MDAsXG4gICAgICBIRUlHSFQgID0gRlVMTFNDUkVFTiA/IHdpbmRvdy5pbm5lckhlaWdodCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIDogNjAwO1xuXG4vLyBpbml0aWFsaXplIHRoZSBnYW1lXG52YXIgICBnYW1lICAgID0gbmV3IFBoYXNlci5HYW1lKCBXSURUSCwgSEVJR0hULCBQaGFzZXIuQVVUTywgJ2dhbWVDb250YWluZXInICk7XG5cbi8vIGFkZCBzdGF0ZXNcbmdhbWUuc3RhdGUuYWRkKCBcImJvb3RcIiwgaW5pdEJvb3RTdGF0ZSgpICk7XG5nYW1lLnN0YXRlLmFkZCggXCJsb2FkXCIsIGluaXRMb2FkU3RhdGUoKSApO1xuZ2FtZS5zdGF0ZS5hZGQoIFwiZ2FtZVwiLCBpbml0R2FtZVN0YXRlKCkgKTtcblxuZ2FtZS5zdGF0ZS5zdGFydCggXCJib290XCIgKTsiLCJcbnZhciBDT0xMSVNJT05fR1JPVVBTID0ge307XG5DT0xMSVNJT05fR1JPVVBTLkJMT0NLX1NPTElEID0gICAgdHJ1ZTtcbkNPTExJU0lPTl9HUk9VUFMuQkxPQ0tfUk9UQVRFID0gICB0cnVlO1xuQ09MTElTSU9OX0dST1VQUy5QTEFZRVJfU09MSUQgPSAgIHRydWU7XG5DT0xMSVNJT05fR1JPVVBTLlBMQVlFUl9TRU5TT1IgPSAgdHJ1ZTsiLCJcbnZhciBDT0xPUlMgPSB7fTtcbkNPTE9SUy5CQUNLR1JPVU5EX1NLWSA9IFwiIzQ0MjhCQ1wiOyIsIlxudmFyIEVQU0lMT04gPSAwLjAwMDAwMTtcbnZhciBUQVUgPSBNYXRoLlBJICogMjsiLCJmdW5jdGlvbiBHdXMoeCwgeSkge1xuXG4gICAgdGhpcy5zcGVlZCA9IDI1MDsgICAgICAgICAvLyB3YWxrIHNwZWVkXG4gICAgdGhpcy5ncmF2aXR5ID0gMTAwMDsgICAgICAvLyBncmF2aXR5IHNwZWVkXG4gICAgdGhpcy5ob3BTdHJlbmd0aCA9IDYwOyAgIC8vIHN0cmVuZ3RoIG9mIGd1cydzIHdhbGsgY3ljbGUgaG9wc1xuXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7ICAgICAgICAvLyBpbnRlcm5hbCByb3RhdGlvbiBjb3VudGVyXG4gICAgdGhpcy5wcmV2Um90YXRpb24gPSAwOyAgICAvLyBwcmV2aW91cyByb3RhdGlvblxuXG4gICAgdGhpcy5yb3RhdGluZyA9IGZhbHNlOyAgICAvLyBpcyBndXMgcm90YXRpbmc/XG4gICAgdGhpcy5jYW5Sb3RhdGUgPSB0cnVlOyAgICAvLyBjYW4gZ3VzIHJvdGF0ZT9cbiAgICB0aGlzLnRhcmdldFJvdGF0aW9uID0gMDsgIC8vIHRhcmdldCByb3RhdGlvbiBvZiB0aGlzIGZsaXBcblxuICAgIC8vIGNyZWF0ZSBhIHNwcml0ZSBvYmplY3QgYW5kIHNldCBpdHMgYW5jaG9yXG4gICAgdGhpcy5zcHJpdGUgPSBnYW1lLmFkZC5zcHJpdGUoeCwgeSwgJ0d1cycpO1xuXG4gICAgLy8gYXR0YWNoIG91ciBzcHJpdGUgdG8gdGhlIHBoeXNpY3MgZW5naW5lXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZSggdGhpcy5zcHJpdGUsIHRydWUgKTtcbiAgICB0aGlzLnNwcml0ZS5ib2R5LmZpeGVkUm90YXRpb24gPSB0cnVlO1xuICAgIHRoaXMuc3ByaXRlLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoIENPTExJU0lPTl9HUk9VUFMuUExBWUVSX1NPTElEICk7XG4gICAgdGhpcy5zcHJpdGUuYm9keS5jb2xsaWRlcyggWyBDT0xMSVNJT05fR1JPVVBTLkJMT0NLX1NPTElELCBDT0xMSVNJT05fR1JPVVBTLkJMT0NLX1JPVEFURSBdICk7XG5cbiAgICAvLyBjcmVhdGUgZ3VzJ3Mgcm90YXRpb24gc2Vuc29yXG4gICAgdGhpcy5yb3RhdGlvblNlbnNvciA9IHRoaXMuc3ByaXRlLmJvZHkuYWRkUmVjdGFuZ2xlKCB0aGlzLnNwcml0ZS53aWR0aCArIDIsIDI0ICk7XG4gICAgdGhpcy5zcHJpdGUuYm9keS5zZXRDb2xsaXNpb25Hcm91cCggQ09MTElTSU9OX0dST1VQUy5QTEFZRVJfU0VOU09SLCB0aGlzLnJvdGF0aW9uU2Vuc29yICk7XG4gICAgdGhpcy5zcHJpdGUuYm9keS5jb2xsaWRlcyggWyBDT0xMSVNJT05fR1JPVVBTLkJMT0NLX1JPVEFURSBdLCBHdXMucHJvdG90eXBlLnRvdWNoZXNXYWxsLCB0aGlzLCB0aGlzLnJvdGF0aW9uU2Vuc29yICk7XG4gICAgdGhpcy5zcHJpdGUuYm9keS5vbkJlZ2luQ29udGFjdC5hZGQoIEd1cy5wcm90b3R5cGUudG91Y2hlc1dhbGwsIHRoaXMgKTtcbiAgICAvL3RoaXMuc3ByaXRlLmJvZHkuY29sbGlkZXMoIFsgQ09MTElTSU9OX0dST1VQUy5CTE9DS19ST1RBVEUgXSwgR3VzLnByb3RvdHlwZS50b3VjaGVzV2FsbCwgdGhpcyApO1xuXG4gICAgLy8gYWRkIGFuaW1hdGlvbnNcbiAgICB0aGlzLnNwcml0ZS5hbmltYXRpb25zLmFkZCgnc3RhbmQnLCBbMF0sIDEwLCB0cnVlKTtcbiAgICB0aGlzLnNwcml0ZS5hbmltYXRpb25zLmFkZCgnd2FsaycsIFsxLDJdLCAxMCwgdHJ1ZSk7XG4gICAgXG59XG5cbmZ1bmN0aW9uIHNhbmVWZWMoIHZlYyApIHtcbiAgdmFyIHggPSBNYXRoLmFicyggdmVjWzBdICkgPCBFUFNJTE9OID8gMCA6IHZlY1swXTtcbiAgdmFyIHkgPSBNYXRoLmFicyggdmVjWzFdICkgPCBFUFNJTE9OID8gMCA6IHZlY1sxXTtcbiAgcmV0dXJuIHAyLnZlYzIuZnJvbVZhbHVlcyggeCwgeSApO1xufVxuXG5mdW5jdGlvbiBkb3QoIHZlYzEsIHZlYzIgKSB7XG4gIHJldHVybiAodmVjMVswXSAqIHZlYzJbMF0pICsgKHZlYzFbMV0gKiB2ZWMyWzFdKTtcbn1cblxuZnVuY3Rpb24gY2xhbXBBbmdsZVRvVGF1KCBhbmcgKSB7XG5cbiAgYW5nID0gYW5nICUgVEFVO1xuICBpZiAoIGFuZyA8IDAgKSBhbmcgPSBUQVUgLSBhbmc7XG4gIHJldHVybiBhbmc7XG5cbn1cblxuZnVuY3Rpb24gYW5nV2l0aGluKCBhbmcsIG1pbiwgbWF4ICkge1xuXG4gIGFuZyA9IGNsYW1wQW5nbGVUb1RhdSggYW5nICk7XG4gIG1pbiA9IGNsYW1wQW5nbGVUb1RhdSggbWluICk7XG4gIG1heCA9IGNsYW1wQW5nbGVUb1RhdSggbWF4ICk7XG5cbiAgaWYgKCBtaW4gPiBtYXggKSByZXR1cm4gYW5nID49IG1pbiB8fCBhbmcgPD0gbWF4O1xuICBlbHNlIHJldHVybiBhbmcgPj0gbWluICYmIGFuZyA8PSBtYXg7XG5cbn1cblxuR3VzLnByb3RvdHlwZS50b3VjaGVzV2FsbCA9IGZ1bmN0aW9uKCBndXMsIG90aGVyLCBzZW5zb3IsIHNoYXBlLCBjb250YWN0ICkge1xuXG4gIGlmICggIXRoaXMuY2FuUm90YXRlICkgcmV0dXJuO1xuICBpZiAoIHNlbnNvciAhPT0gdGhpcy5yb3RhdGlvblNlbnNvciApIHJldHVybjtcblxuICB2YXIgbGVmdFZlYyA9IHAyLnZlYzIuZnJvbVZhbHVlcyggLU1hdGguY29zKCB0aGlzLnJvdGF0aW9uICksIC1NYXRoLnNpbiggdGhpcy5yb3RhdGlvbiApICk7XG4gIHZhciBkID0gZG90KCBzYW5lVmVjKCBsZWZ0VmVjICksIHNhbmVWZWMoIGNvbnRhY3RbMF0ubm9ybWFsQSApICk7XG4gIGlmICggY29udGFjdFswXS5ib2R5QiA9PT0gZ3VzLmRhdGEgKSBkICo9IC0xO1xuXG4gIGlmICggZCA+IDEgLSBFUFNJTE9OICkgdGhpcy5yb3RhdGUoIFwibGVmdFwiICk7XG4gIGVsc2UgaWYgKCBkIDwgLTEgKyBFUFNJTE9OICkgdGhpcy5yb3RhdGUoIFwicmlnaHRcIiApO1xuXG59XG5cbkd1cy5wcm90b3R5cGUuaXNUb3VjaGluZyA9IGZ1bmN0aW9uKCBzaWRlICkge1xuICAvLyBnZXQgdGhlIHZlY3RvciB0byBjaGVja1xuICB2YXIgZGlyVmVjID0gbnVsbDtcbiAgaWYgKCBzaWRlID09PSBcImxlZnRcIiApIGRpclZlYyA9IHAyLnZlYzIuZnJvbVZhbHVlcyggLU1hdGguY29zKCB0aGlzLnJvdGF0aW9uICksIC1NYXRoLnNpbiggdGhpcy5yb3RhdGlvbiApICk7XG4gIGlmICggc2lkZSA9PT0gXCJyaWdodFwiICkgZGlyVmVjID0gcDIudmVjMi5mcm9tVmFsdWVzKCBNYXRoLmNvcyggdGhpcy5yb3RhdGlvbiApLCBNYXRoLnNpbiggdGhpcy5yb3RhdGlvbiApICk7XG4gIGlmICggc2lkZSA9PT0gXCJkb3duXCIgKSBkaXJWZWMgPSBwMi52ZWMyLmZyb21WYWx1ZXMoIC1NYXRoLnNpbiggdGhpcy5yb3RhdGlvbiApLCBNYXRoLmNvcyggdGhpcy5yb3RhdGlvbiApICk7XG4gIGlmICggc2lkZSA9PT0gXCJ1cFwiICkgZGlyVmVjID0gcDIudmVjMi5mcm9tVmFsdWVzKCBNYXRoLnNpbiggdGhpcy5yb3RhdGlvbiApLCAtTWF0aC5jb3MoIHRoaXMucm90YXRpb24gKSApO1xuXG4gIC8vIGxvb3AgdGhyb3VoZyBhbGwgY29udGFjdHNcbiAgZm9yICggdmFyIGkgPSAwOyBpIDwgZ2FtZS5waHlzaWNzLnAyLndvcmxkLm5hcnJvd3BoYXNlLmNvbnRhY3RFcXVhdGlvbnMubGVuZ3RoOyArK2kgKSB7XG4gICAgdmFyIGNvbnRhY3QgPSBnYW1lLnBoeXNpY3MucDIud29ybGQubmFycm93cGhhc2UuY29udGFjdEVxdWF0aW9uc1tpXTtcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgcGxheWVyIGhhcyBiZWVuIGFmZmVjdGVkXG4gICAgaWYgKCBjb250YWN0LmJvZHlBID09PSB0aGlzLnNwcml0ZS5ib2R5LmRhdGEgfHwgY29udGFjdC5ib2R5QiA9PT0gdGhpcy5zcHJpdGUuYm9keS5kYXRhICkge1xuXG4gICAgICAvLyBpZiB0aGUgZG90IG9mIHRoZSBub3JtYWwgaXMgMSwgdGhlIHBsYXllciBpcyBwZXJwZW5kaWN1bGFyIHRvIHRoZSBjb2xsaXNpb25cbiAgICAgIHZhciBkID0gZG90KCBzYW5lVmVjKCBkaXJWZWMgKSwgc2FuZVZlYyggY29udGFjdC5ub3JtYWxBICkgKTtcbiAgICAgIGlmICggY29udGFjdC5ib2R5QSA9PT0gdGhpcy5zcHJpdGUuYm9keS5kYXRhICkgZCAqPSAtMTtcbiAgICAgIGlmICggZCA+IDEgLSBFUFNJTE9OICYmIGNvbnRhY3QuYm9keUEgIT09IG51bGwgJiYgY29udGFjdC5ib2R5QiAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cbn1cblxuR3VzLnByb3RvdHlwZS5jaGVja0ZvclJvdGF0aW9uID0gZnVuY3Rpb24oIGRpciApIHtcblxuICBpZiAoIGRpciA9PT0gXCJsZWZ0XCIgJiYgdGhpcy5pc1RvdWNoaW5nKCBcImxlZnRcIiApICkge1xuICAgIHRoaXMucm90YXRlKCBcImxlZnRcIiApO1xuICB9IGVsc2UgaWYgKCBkaXIgPT09IFwicmlnaHRcIiAmJiB0aGlzLmlzVG91Y2hpbmcoIFwicmlnaHRcIiApICkge1xuICAgIHRoaXMucm90YXRlKCBcInJpZ2h0XCIgKTtcbiAgfVxuXG59XG5cbkd1cy5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24oIGRpciApIHtcblxuICBpZiAoIHRoaXMucm90YXRpbmcgKSByZXR1cm47XG5cbiAgLy8gZmluZCB0aGUgYW5nbGUgdG8gcm90YXRlIGJ5XG4gIGlmICggZGlyID09PSBcImxlZnRcIiApIHtcbiAgICB2YXIgcm90ID0gLU1hdGguUEkgLyAyO1xuICB9IGVsc2Uge1xuICAgIHZhciByb3QgPSBNYXRoLlBJIC8gMjtcbiAgfVxuXG4gIC8vIGNoYW5nZSB2YWx1ZXNcbiAgdGhpcy50YXJnZXRSb3RhdGlvbiAtPSByb3Q7XG4gIHRoaXMucm90YXRpbmcgPSB0cnVlO1xuICB0aGlzLmNhblJvdGF0ZSA9IGZhbHNlO1xuICB0aGlzLnNwcml0ZS5ib2R5LmVuYWJsZWQgPSBmYWxzZTtcblxufVxuXG5HdXMucHJvdG90eXBlLmZpbmlzaFJvdGF0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8ga2VlcCBvdXIgcm90YXRpb24gYmV0d2VlbiB0YXUgYW5kIDBcbiAgaWYgKCB0aGlzLnJvdGF0aW9uIDwgMCApIHRoaXMucm90YXRpb24gPSBUQVUgKyB0aGlzLnJvdGF0aW9uO1xuXG4gIC8vIHNldCBncmF2aXR5IHJlbGF0aXZlIHRvIG91ciBuZXcgYXhpc1xuICB0aGlzLnNwcml0ZS5ib2R5LmdyYXZpdHkueSA9IE1hdGguZmxvb3IoIE1hdGguY29zKCB0aGlzLnJvdGF0aW9uICkgKiB0aGlzLmdyYXZpdHkgKTtcbiAgdGhpcy5zcHJpdGUuYm9keS5ncmF2aXR5LnggPSBNYXRoLmZsb29yKCBNYXRoLnNpbiggdGhpcy5yb3RhdGlvbiApICogLXRoaXMuZ3Jhdml0eSApO1xuXG4gIC8vIGNoYW5nZSByb3RhdGlvblxuICB0aGlzLnNwcml0ZS5yb3RhdGlvbiA9IHRoaXMucm90YXRpb247XG4gIHRoaXMuc3ByaXRlLmJvZHkucm90YXRpb24gPSB0aGlzLnJvdGF0aW9uO1xuXG4gIC8vIHJlc2V0IHN0YXRlIGFmdGVyIHJvdGF0aW9uXG4gIHRoaXMuc3ByaXRlLmJvZHkuZW5hYmxlZCA9IHRydWU7XG4gIHRoaXMucm90YXRpbmcgPSBmYWxzZTtcbiAgZGVsZXRlIHRoaXMucm90YXRlVHdlZW47XG5cbn1cblxuR3VzLnByb3RvdHlwZS5hcHBseUdyYXZpdHkgPSBmdW5jdGlvbigpIHtcblxuICBpZiAoICF0aGlzLmlzVG91Y2hpbmcoIFwiZG93blwiICkgKSB7XG5cbiAgICB0aGlzLnNwcml0ZS5ib2R5LnZlbG9jaXR5LnggKz0gTWF0aC5mbG9vciggTWF0aC5zaW4oIHRoaXMucm90YXRpb24gKSAqICggLXRoaXMuZ3Jhdml0eSAqIDAuMDE2ICkgKTtcbiAgICB0aGlzLnNwcml0ZS5ib2R5LnZlbG9jaXR5LnkgKz0gTWF0aC5mbG9vciggTWF0aC5jb3MoIHRoaXMucm90YXRpb24gKSAqICggdGhpcy5ncmF2aXR5ICogMC4wMTYgKSApO1xuXG4gIH1cblxufVxuXG5HdXMucHJvdG90eXBlLndhbGsgPSBmdW5jdGlvbiggZGlyICkge1xuXG4gIGlmICggZGlyID09PSBcImxlZnRcIiApIHtcbiAgICB2YXIgaW50ZW5kZWRWZWxvY2l0eSA9IC10aGlzLnNwZWVkO1xuICAgIHRoaXMuc3ByaXRlLnNjYWxlLnggPSAtMTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaW50ZW5kZWRWZWxvY2l0eSA9IHRoaXMuc3BlZWQ7XG4gICAgdGhpcy5zcHJpdGUuc2NhbGUueCA9IDE7XG4gIH1cblxuICB2YXIgY29zaW5lID0gTWF0aC5jb3MoIHRoaXMucm90YXRpb24gKTtcbiAgaWYgKCBNYXRoLmFicyggY29zaW5lICkgPiBFUFNJTE9OICkge1xuICAgIHRoaXMuc3ByaXRlLmJvZHkudmVsb2NpdHkueCA9IGNvc2luZSAqIGludGVuZGVkVmVsb2NpdHk7XG4gICAgaWYgKCB0aGlzLmlzVG91Y2hpbmcoIFwiZG93blwiICkgKSB0aGlzLnNwcml0ZS5ib2R5LnZlbG9jaXR5LnkgPSBjb3NpbmUgKiAtdGhpcy5ob3BTdHJlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2luZSA9IE1hdGguc2luKCB0aGlzLnJvdGF0aW9uICk7XG4gICAgdGhpcy5zcHJpdGUuYm9keS52ZWxvY2l0eS55ID0gc2luZSAqIGludGVuZGVkVmVsb2NpdHk7XG4gICAgaWYgKCB0aGlzLmlzVG91Y2hpbmcoIFwiZG93blwiICkgKSB0aGlzLnNwcml0ZS5ib2R5LnZlbG9jaXR5LnggPSBzaW5lICogdGhpcy5ob3BTdHJlbmd0aDtcbiAgfVxuXG4gIHRoaXMuc3ByaXRlLmFuaW1hdGlvbnMucGxheSggJ3dhbGsnICk7XG4gIHRoaXMuY2FuUm90YXRlID0gdHJ1ZTtcblxufVxuXG5HdXMucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcblxuICB0aGlzLnNwcml0ZS5hbmltYXRpb25zLnBsYXkoICdzdGFuZCcgKTtcblxufVxuXG5HdXMucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuXG4gIC8vIGNsZWFyIGhvcml6b250YWwgbW92ZW1lbnRcbiAgaWYgKCBNYXRoLmFicyggTWF0aC5jb3MoIHRoaXMucm90YXRpb24gKSApID4gRVBTSUxPTiApIHRoaXMuc3ByaXRlLmJvZHkudmVsb2NpdHkueCA9IDA7XG4gIGVsc2UgdGhpcy5zcHJpdGUuYm9keS52ZWxvY2l0eS55ID0gMDtcblxuICAvLyBjaGVjayB0byBzZWUgaWYgd2UncmUgcm90YXRpbmdcbiAgaWYgKCB0aGlzLnJvdGF0aW5nICkge1xuXG4gICAgLy8gc3RvcCBhbGwgbW92ZW1lbnRcbiAgICB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLnNwcml0ZS5ib2R5LnZlbG9jaXR5LnkgPSAwO1xuICAgIHRoaXMuc3ByaXRlLmJvZHkudmVsb2NpdHkueCA9IDA7XG5cbiAgICAvLyBjcmVhdGUgYSByb3RhdGUgdHdlZW5cbiAgICBpZiAoIHRoaXMucm90YXRlVHdlZW4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHRoaXMucm90YXRlVHdlZW4gPSBnYW1lLmFkZC50d2VlbiggdGhpcy5zcHJpdGUgKS50byggeyByb3RhdGlvbjogdGhpcy50YXJnZXRSb3RhdGlvbiB9LCAzMDAsIFBoYXNlci5FYXNpbmcuRGVmYXVsdCwgdHJ1ZSApXG4gICAgICAub25Db21wbGV0ZS5hZGQoIGZ1bmN0aW9uKCBndXMsIHR3ZWVuICkge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy50YXJnZXRSb3RhdGlvbiAlICggVEFVICk7XG4gICAgICAgIHRoaXMuZmluaXNoUm90YXRpb24oKTtcbiAgICAgICAgICAvLyBzZXQgZ3Jhdml0eSByZWxhdGl2ZSB0byBvdXIgbmV3IGF4aXNcbiAgICAgIH0sIHRoaXMgKTtcbiAgICB9XG5cbiAgICAvLyBjaGFuZ2Ugcm90YXRpb25cbiAgfSBlbHNlIHtcblxuICAgIC8vIGRvIGdyYXZpdHlcbiAgICB0aGlzLmFwcGx5R3Jhdml0eSgpO1xuXG4gICAgLy8gY2hlY2sgZm9yIGlucHV0XG4gICAgaWYgKCBjdXJzb3JzLmxlZnQuaXNEb3duICkge1xuICAgICAgLy9pZiAoIHRoaXMuY2FuUm90YXRlICkgdGhpcy5jaGVja0ZvclJvdGF0aW9uKCBcImxlZnRcIiApO1xuICAgICAgdGhpcy53YWxrKCBcImxlZnRcIiApO1xuICAgIH0gZWxzZSBpZiAoIGN1cnNvcnMucmlnaHQuaXNEb3duICkge1xuICAgICAgLy9pZiAoIHRoaXMuY2FuUm90YXRlICkgdGhpcy5jaGVja0ZvclJvdGF0aW9uKCBcInJpZ2h0XCIgKTtcbiAgICAgIHRoaXMud2FsayggXCJyaWdodFwiICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RvcCgpO1xuICAgIH1cblxuICB9XG5cbn0iLCJmdW5jdGlvbiBpbml0Qm9vdFN0YXRlKCkge1xuXG4gIHZhciBzdGF0ZSA9IHt9O1xuXG4gIHN0YXRlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgY29uc29sZS5sb2coIFwiSW5pdGlhbGl6aW5nIHBoeXNpY3MuLi5cIiApO1xuXG4gICAgLy8gc3RhcnQgZ2FtZSBwaHlzaWNzXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKCBQaGFzZXIuUGh5c2ljcy5QMkpTICk7XG4gICAgZ2FtZS5waHlzaWNzLnAyLnNldEltcGFjdEV2ZW50cyggdHJ1ZSApO1xuXG4gICAgY29uc29sZS5sb2coIFwiQ3JlYXRpbmcgY29sbGlzaW9uIGdyb3Vwcy4uLlwiICk7XG5cbiAgICBmb3IgKCB2YXIga2V5IGluIENPTExJU0lPTl9HUk9VUFMgKSB7XG4gICAgICBDT0xMSVNJT05fR1JPVVBTW2tleV0gPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyggXCJCb290c3RyYXAgY29tcGxldGVcIiApO1xuXG4gICAgZ2FtZS5zdGF0ZS5zdGFydCggXCJsb2FkXCIgKTtcblxuICB9XG5cbiAgcmV0dXJuIHN0YXRlO1xuXG59XG4iLCJmdW5jdGlvbiBpbml0R2FtZVN0YXRlKCkge1xuXG4gIHZhciBzdGF0ZSA9IHt9O1xuICB2YXIgZ3VzLCBibG9ja3M7XG5cbiAgc3RhdGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICB9XG5cbiAgc3RhdGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgY29uc29sZS5sb2coIFwiU3RhcnRpbmcgd29ybGQuLi5cIiApO1xuXG4gICAgZ2FtZS5hZGQucGx1Z2luKCBQaGFzZXIuUGx1Z2luLkRlYnVnICk7XG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoIC00MDAsIC0zMDAsIDgwMCwgNjAwICk7XG4gICAgZ2FtZS5waHlzaWNzLnAyLnNldEJvdW5kc1RvV29ybGQoKTtcbiAgICAvL2dhbWUucGh5c2ljcy5hcmNhZGUuc2V0Qm91bmRzKCAtMTAwMDAsIC0xMDAwMCwgMjAwMDAsIDIwMDAwICk7XG5cbiAgICBjb25zb2xlLmxvZyggXCJDcmVhdGluZyBHdXMuLi5cIiApO1xuXG4gICAgZ3VzID0gbmV3IEd1cyggMCwgMCApO1xuXG4gICAgY29uc29sZS5sb2coIFwiQ3JlYXRpbmcgYmxvY2tzLi4uXCIgKTtcblxuICAgIGJsb2NrcyA9IGdhbWUuYWRkLmdyb3VwKCk7XG4gICAgYmxvY2tzLmVuYWJsZUJvZHkgPSB0cnVlO1xuICAgIGJsb2Nrcy5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCAxMDsgKytpICkge1xuICAgICAgdmFyIG5ld0Jsb2NrID0gYmxvY2tzLmNyZWF0ZSggLTEyOCArICgzMiAqIGkpLCAxMjgsICdCcmlja1JlZCcgKTtcbiAgICAgIC8vIG5ld0Jsb2NrLmJvZHkuc3RhdGljID0gdHJ1ZTtcbiAgICAgIFxuICAgICAgLy9nYW1lLnBoeXNpY3MucDIuZW5hYmxlKCBuZXdCbG9jaywgdHJ1ZSApO1xuICAgICAgbmV3QmxvY2suYm9keS5zZXRSZWN0YW5nbGUoIDMyLCAzMiApO1xuICAgICAgbmV3QmxvY2suYm9keS5zZXRDb2xsaXNpb25Hcm91cCggQ09MTElTSU9OX0dST1VQUy5CTE9DS19ST1RBVEUgKTtcbiAgICAgIG5ld0Jsb2NrLmJvZHkuY29sbGlkZXMoIFsgQ09MTElTSU9OX0dST1VQUy5QTEFZRVJfU09MSUQsIENPTExJU0lPTl9HUk9VUFMuUExBWUVSX1NFTlNPUiBdICk7XG4gICAgICBuZXdCbG9jay5ib2R5LnN0YXRpYyA9IHRydWU7XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCAxMDsgKytpICkge1xuICAgICAgdmFyIG5ld0Jsb2NrID0gYmxvY2tzLmNyZWF0ZSggLTE2MCwgMTI4IC0gKDMyICogaSksICdCcmlja1JlZCcgKTtcbiAgICAgIG5ld0Jsb2NrLmJvZHkuc2V0UmVjdGFuZ2xlKCAzMiwgMzIgKTtcbiAgICAgIG5ld0Jsb2NrLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoIENPTExJU0lPTl9HUk9VUFMuQkxPQ0tfUk9UQVRFICk7XG4gICAgICBuZXdCbG9jay5ib2R5LmNvbGxpZGVzKCBbIENPTExJU0lPTl9HUk9VUFMuUExBWUVSX1NPTElELCBDT0xMSVNJT05fR1JPVVBTLlBMQVlFUl9TRU5TT1IgXSApO1xuICAgICAgbmV3QmxvY2suYm9keS5zdGF0aWMgPSB0cnVlO1xuICAgIH1cblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgMTA7ICsraSApIHtcbiAgICAgIHZhciBuZXdCbG9jayA9IGJsb2Nrcy5jcmVhdGUoIDE5MiwgMTI4IC0gKDMyICogaSksICdCcmlja1JlZCcgKTtcbiAgICAgIG5ld0Jsb2NrLmJvZHkuc2V0UmVjdGFuZ2xlKCAzMiwgMzIgKTtcbiAgICAgIG5ld0Jsb2NrLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoIENPTExJU0lPTl9HUk9VUFMuQkxPQ0tfUk9UQVRFICk7XG4gICAgICBuZXdCbG9jay5ib2R5LmNvbGxpZGVzKCBbIENPTExJU0lPTl9HUk9VUFMuUExBWUVSX1NPTElELCBDT0xMSVNJT05fR1JPVVBTLlBMQVlFUl9TRU5TT1IgXSApO1xuICAgICAgbmV3QmxvY2suYm9keS5zdGF0aWMgPSB0cnVlO1xuICAgIH1cblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgMTA7ICsraSApIHtcbiAgICAgIHZhciBuZXdCbG9jayA9IGJsb2Nrcy5jcmVhdGUoIC0yNTYsIDEyOCAtICgzMiAqIGkpLCAnQnJpY2tSZWQnICk7XG4gICAgICBuZXdCbG9jay5ib2R5LnNldFJlY3RhbmdsZSggMzIsIDMyICk7XG4gICAgICBuZXdCbG9jay5ib2R5LnNldENvbGxpc2lvbkdyb3VwKCBDT0xMSVNJT05fR1JPVVBTLkJMT0NLX1JPVEFURSApO1xuICAgICAgbmV3QmxvY2suYm9keS5jb2xsaWRlcyggWyBDT0xMSVNJT05fR1JPVVBTLlBMQVlFUl9TT0xJRCwgQ09MTElTSU9OX0dST1VQUy5QTEFZRVJfU0VOU09SIF0gKTtcbiAgICAgIG5ld0Jsb2NrLmJvZHkuc3RhdGljID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyggXCJCaW5kaW5nIHRvIGtleXMuLi5cIiApO1xuXG4gICAgY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuXG4gIH1cblxuICBzdGF0ZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAvL2dhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZSggZ3VzLnNwcml0ZSwgYmxvY2tzICk7XG5cbiAgICBndXMudXBkYXRlKCk7XG5cbiAgICBnYW1lLmNhbWVyYS5kaXNwbGF5T2JqZWN0LnBpdm90LnggPSBndXMuc3ByaXRlLnBvc2l0aW9uLng7XG4gICAgZ2FtZS5jYW1lcmEuZGlzcGxheU9iamVjdC5waXZvdC55ID0gZ3VzLnNwcml0ZS5wb3NpdGlvbi55O1xuICAgIGdhbWUuY2FtZXJhLmRpc3BsYXlPYmplY3Qucm90YXRpb24gPSAoTWF0aC5QSSAqIDIpIC0gZ3VzLnNwcml0ZS5yb3RhdGlvbjtcbiAgICAvL2dhbWUud29ybGQucm90YXRpb24gPSAoTWF0aC5QSSAqIDIpIC0gZ3VzLnJvdGF0aW9uO1xuICAgIC8vZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKCBndXMuc3ByaXRlLCBibG9ja3MgKTtcblxuICB9XG5cbiAgcmV0dXJuIHN0YXRlO1xuXG59XG4iLCJcbmZ1bmN0aW9uIGluaXRMb2FkU3RhdGUoKSB7XG5cbiAgdmFyIHN0YXRlID0ge307XG5cbiAgc3RhdGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGNvbnNvbGUubG9nKCBcIkxvYWRpbmcgYXNzZXRzLi4uXCIgKTtcblxuICAgIGdhbWUubG9hZC5pbWFnZSgnQnJpY2tCbGFjaycsICdwdWJsaWMvYXNzZXRzL2ltYWdlcy9icmlja19ibGFjay5wbmcnKTtcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ0JyaWNrQnJlYWsnLCAncHVibGljL2Fzc2V0cy9pbWFnZXMvYnJpY2tfYnJlYWsucG5nJyk7XG4gICAgZ2FtZS5sb2FkLmltYWdlKCdCcmlja1JlZCcsICdwdWJsaWMvYXNzZXRzL2ltYWdlcy9icmlja19yZWQucG5nJyk7XG4gICAgZ2FtZS5sb2FkLmltYWdlKCdHaXJkZXInLCAncHVibGljL2Fzc2V0cy9pbWFnZXMvZ2lyZGVyLnBuZycpO1xuICAgIGdhbWUubG9hZC5pbWFnZSgnVG9vbCcsICdwdWJsaWMvYXNzZXRzL2ltYWdlcy90b29sLnBuZycpO1xuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnR3VzJywgJ3B1YmxpYy9hc3NldHMvaW1hZ2VzL2d1cy5wbmcnLCAzMiwgMzIpO1xuXG4gICAgY29uc29sZS5sb2coIFwiRG9uZSBsb2FkaW5nXCIgKTtcblxuICB9XG5cbiAgc3RhdGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBzZXQgYmFja2dyb3VuZCBjb2xvclxuICAgICAgZ2FtZS5zdGFnZS5zZXRCYWNrZ3JvdW5kQ29sb3IoIFwiIzQ0MjhCQ1wiICk7XG5cbiAgICAgIC8vIHN0YXJ0IGdhbWUgc3RhdGVcbiAgICAgIGdhbWUuc3RhdGUuc3RhcnQoIFwiZ2FtZVwiICk7XG5cbiAgfVxuXG4gIHJldHVybiBzdGF0ZTtcblxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
