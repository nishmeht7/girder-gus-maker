var COLLISION_GROUPS = require( "../consts/collisionGroups" );
var TAU = require( "../consts" ).TAU;

function Tool( x, y ) {

  var game = window.game;

  this.sprite = game.add.sprite( x, y, "Tool" );
  this.sprite.initialRotation = Math.random() * TAU;

  game.physics.p2.enable( this.sprite, false );

  this.setCollisions();

  game.toolsToCollect = game.toolsToCollect || [];
  game.toolsToCollect.push( this );

}

Tool.prototype.setCollisions = function() {

  this.sprite.body.setRectangle( 32, 32 );
  this.sprite.body.kinematic = true;

  this.sprite.body.setCollisionGroup( COLLISION_GROUPS.ITEM );
  this.sprite.body.collides( [ COLLISION_GROUPS.PLAYER_SOLID ] );
  this.sprite.body.onBeginContact.add( Tool.prototype.collect, this );
  this.sprite.body.fixedRotation = true;

}

Tool.prototype.collect = function( tool, other, shape, otherShape, contact ) {

  console.log( "tool collected!" );
  this.sprite.visible = false;
  this.sprite.body.clearCollision();
  game.toolsRemaining--;

}

Tool.prototype.reset = function() {

  if ( this.sprite.visible === false ) {
    this.sprite.visible = true;
    this.setCollisions();
    game.toolsRemaining++;
  }

}

Tool.prototype.update = function() {

  this.sprite.rotation = this.sprite.initialRotation + (Math.sin( TAU/100 * (game.time.now/1000) ) * TAU);

}

module.exports = Tool;