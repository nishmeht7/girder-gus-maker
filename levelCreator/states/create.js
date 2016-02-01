const COLORS = require('../../game/js/consts/colors');

function initCreateState() {
  const state = {};
  const eventEmitter = window.eventEmitter;

  state.preload = function() {
    eventEmitter.emit('loaded', () => {})
  }

  state.create = function() {
    const game = window.game;
    game.stage.setBackgroundColor( COLORS.DEFAULT_SKY )
    eventEmitter.emit('loaded', () => {})

    game.input.mouse.onMouseDown = function() {
      console.log('click!');
      console.log(game.input.mousePointer.x);
      console.log(game.input.mousePointer.y);
    }
  }

  state.update = function() {}

  return state;
};

module.exports = initCreateState;

// var LevelGenerator = require( "../generator" );
//
// function screenToWorldSpace( point ) {
//
//   var cosine = Math.cos( game.camera.displayObject.rotation ), sine = Math.sin( game.camera.displayObject.rotation );
//   var topleft = {
//     x: game.camera.displayObject.pivot.x - ( cosine * game.camera.width / 2 ) - ( sine * game.camera.height / 2 ),
//     y: game.camera.displayObject.pivot.y - ( cosine * game.camera.height / 2 ) + ( sine * game.camera.width / 2 )
//   }
//
//   return new Phaser.Point( point.x * cosine + point.y * sine + topleft.x,
//                            point.y * cosine - point.x * sine + topleft.y );
//
// }
//
// function initGameState() {
//
//   var state = {};
//   var gus, marker, generator, restartTimeout, hudCounters;
//   var game = window.game;
//
//   state.preload = function () {
//     // set background color
//     game.stage.setBackgroundColor( '#4428BC' );
//
//   }
//
//   state.create = function () {
//
//     // generate the rest of the fucking level
//     console.log( "Generating level from level data..." );
//     generator.parseObjects();
//
//     if ( game.toolsToCollect !== undefined ) {
//       game.toolsRemaining = game.toolsToCollect.length;
//     } else {
//       game.toolsRemaining = 1;
//       game.toolsToCollect = [];
//       console.error( "No tools were included in this level" );
//     }
//
//     console.log( "Creating Gus..." );
//
//     if ( game.gusStartPos === undefined ) {
//       game.gusStartPos = { x: 0, y: 0 };
//     }
//
//     gus = new Gus( game.gusStartPos.x, game.gusStartPos.y );
//     gus.girders = generator.getStartingGirders();
//     marker = new GirderMarker();
//     marker.setMaster( gus );
//
//     console.log( "Binding to keys..." );
//
//     game.cursors = game.input.keyboard.createCursorKeys();
//     marker.setPlaceGirderButton( game.input.keyboard.addKey( Phaser.KeyCode.SPACEBAR ) );
//     game.input.keyboard.addKey( Phaser.KeyCode.R ).onDown.add( function() { gus.doom() }, this, 0 );
//
//     // make hud icons
//     hudCounters = [
//       { icon: game.add.sprite( 41, 41, "Tool" ), value: function() { return game.toolsRemaining } },
//       { icon: game.add.sprite( 141, 41, "Girder" ), value: function() { return gus.girders } }
//     ];
//
//     hudCounters.map( function( counter ) {
//       counter.icon.initPos = { x: counter.icon.position.x, y: counter.icon.position.y };
//       counter.icon.anchor = new Phaser.Point( 0.5, 0.5 );
//       counter.text = game.add.text( counter.icon.position.x, counter.icon.position.y, "", { font: "bold 28pt mono" } );
//       counter.text.anchor = new Phaser.Point( 0, 0.5 );
//       return counter;
//     });
//
//   }
//
//   state.update = function () {
//
//     // update actors
//     gus.update();
//     marker.update();
//     game.toolsToCollect.forEach( function( tool ) { tool.update() });
//
//     if ( game.toolsRemaining === 0 ) {
//       if ( restartTimeout === undefined ) restartTimeout = setTimeout( function() { state.restartLevel() }, 10000 );
//
//       game.camera.scale.x *= 1 + game.time.physicsElapsed;
//       game.camera.scale.y *= 1 + game.time.physicsElapsed;
//       gus.sprite.rotation += game.time.physicsElapsed * 60;
//     } else if ( gus.isDead && restartTimeout === undefined ) {
//       restartTimeout = setTimeout( function() { state.restartLevel() }, 5000 );
//     }
//
//     // lock camera to player
//     game.camera.displayObject.pivot.x = gus.sprite.position.x;
//     game.camera.displayObject.pivot.y = gus.sprite.position.y;
//     game.camera.displayObject.rotation = (Math.PI * 2) - gus.sprite.rotation;
//
//     // render HUD
//     hudCounters.forEach( function( counter ) {
//       counter.icon.position = screenToWorldSpace( counter.icon.initPos );
//       counter.icon.rotation = gus.sprite.rotation;
//
//       var textpos = { x: counter.icon.initPos.x, y: counter.icon.initPos.y };
//       textpos.x += 32;
//       counter.text.position = screenToWorldSpace( textpos );
//       counter.text.text = counter.value();
//       counter.text.rotation = gus.sprite.rotation;
//     })
//
//   }
//
//   state.restartLevel = function () {
//
//     game.toolsToCollect.forEach( function( tool ) { tool.reset() });
//     marker.girdersPlaced.forEach( function( girder ) { girder.sprite.destroy() });
//
//     gus.respawn();
//
//     game.camera.scale.x = 1;
//     game.camera.scale.y = 1;
//
//     restartTimeout = undefined;
//
//   }
//
//   return state;
//
// }
//
// module.exports = initGameState;
