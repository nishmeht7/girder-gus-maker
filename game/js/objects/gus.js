function Gus(x, y) {

    this.speed = 250;

    this.sprite = game.add.sprite(x, y, 'Gus');
    this.sprite.anchor.setTo( 0.5, 0.5 );

    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

    this.sprite.body.gravity.y = 500;
    this.sprite.body.maxVelocity.y = 1000;

    this.sprite.animations.add('stand', [0], 10, true);
    this.sprite.animations.add('walk', [1,2], 10, true);

    this.facing = 'right';
    this.rotation = 0;
    this.prevRotation = 0;

    this.rotating = false;
    this.canRotate = true;
    this.targetRotation = 0;
    
}

Gus.prototype.isTouching = function( side ) {
  if ( side === "left" ) {
    if ( this.rotation === 0 )            return this.sprite.body.touching.left;
    if ( this.rotation === Math.PI/2 )    return this.sprite.body.touching.down;
    if ( this.rotation === Math.PI )      return this.sprite.body.touching.right;
    if ( this.rotation === 3*Math.PI/2 )  return this.sprite.body.touching.up;
  } else {
    if ( this.rotation === 0 )            return this.sprite.body.touching.right;
    if ( this.rotation === Math.PI/2 )    return this.sprite.body.touching.up;
    if ( this.rotation === Math.PI )      return this.sprite.body.touching.left;
    if ( this.rotation === 3*Math.PI/2 )  return this.sprite.body.touching.down;
  }

  console.error( "!!!!!!ALERT!!!!! check Gus.prototype.isTouching because David didn't account for this.rotation being", this.rotation );
}

Gus.prototype.checkForRotation = function( dir ) {

  if ( dir === "left" && this.isTouching( "left" ) ) {
    this.rotate( "left" );
  } else if ( dir === "right" && this.isTouching( "right" ) ) {
    this.rotate( "right" );
  }

}

Gus.prototype.rotate = function( dir ) {

  if ( dir === "left" ) {
    var rot = -Math.PI / 2;
  } else {
    var rot = Math.PI / 2;
  }

  this.targetRotation -= rot;
  this.rotating = true;

}

Gus.prototype.finishRotation = function() {

  this.sprite.body.gravity.y = Math.floor( Math.cos( this.rotation ) * 500 );
  this.sprite.body.gravity.x = Math.floor( Math.sin( this.rotation ) * -500 );

  this.sprite.rotation = this.rotation;

  this.canRotate = false;
  this.rotating = false;
  delete this.rotateTween;

}

Gus.prototype.walk = function( dir ) {

  if ( dir === "left" ) {
    var intendedVelocity = -this.speed;
    this.sprite.scale.x = -1;
  } else {
    var intendedVelocity = this.speed;
    this.sprite.scale.x = 1;
  }

  console.log( this.isTouching( "right" ), this.rotation === Math.PI/2 );

  var cosine = Math.cos( this.rotation );
  if ( Math.abs( cosine ) > EPSILON ) {
    this.sprite.body.velocity.x = cosine * intendedVelocity;
  } else {
    this.sprite.body.velocity.y = Math.sin( this.rotation ) * intendedVelocity;
  }

  this.sprite.animations.play( 'walk' );
  this.canRotate = true;

}

Gus.prototype.stop = function() {

  this.sprite.animations.play( 'stand' );

}

Gus.prototype.update = function() {

  if ( Math.abs( Math.cos( this.rotation ) ) > EPSILON ) this.sprite.body.velocity.x = 0;
  else this.sprite.body.velocity.y = 0;

  if ( this.rotating ) {

    this.stop();
    this.sprite.body.velocity.y = 0;
    this.sprite.body.velocity.x = 0;

    if ( this.rotateTween === undefined ) {
      this.rotateTween = game.add.tween( this.sprite ).to( { rotation: this.targetRotation }, 1000, Phaser.Easing.Default, true )
      .onComplete.add( function( gus, tween ) {
        this.rotation = this.targetRotation % ( Math.PI * 2 );
        this.finishRotation();
      }, this );
    }

    // if ( this.rotateTime <= 0 ) {
    //   this.rotation = this.targetRotation;
    //   this.finishRotation();
    // } else {
    //   this.rotateTime -= game.time.elapsed;
    //   this.rotation = game.math.linear( this.prevRotation, this.targetRotation, 1 - this.rotateTime );
    //   this.sprite.rotation = this.rotation;
    //   console.log( this.rotation );
    // }

  } else {

    if ( cursors.left.isDown ) {
      this.walk( "left" );
      if ( this.canRotate ) this.checkForRotation( "left" );
    } else if ( cursors.right.isDown ) {
      this.walk( "right" );
      if ( this.canRotate ) this.checkForRotation( "right" );
    } else {
      this.stop();
    }

    

  }

}