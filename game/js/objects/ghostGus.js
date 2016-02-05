'use strict';

const game = window.game;

const Gus = require('./gus');
const GhostGirderMarker = require('./ghostGirderMarker');
const ParticleBurst = require("../particles/burst");

const COLLISION_GROUPS = require("../consts/collisionGroups");
const EPSILON = require("../consts").EPSILON;
const TAU = require("../consts").TAU;

class GhostGus extends Gus {
  constructor(x, y) {
    super(x, y, false);
    this.sprite.alpha = 0.5;

    this.startTime = game.time.now + 500;
    this.timingTolerance = -5; // in ms

    console.log(this.startTime);

    this.records =
[{"INPUT":[2],"ENDTIME":12317},{"INPUT":[0],"ENDTIME":11517},{"INPUT":[1],"ENDTIME":11167},{"INPUT":[0],"ENDTIME":10883},{"INPUT":[2],"ENDTIME":10850},{"INPUT":[0],"ENDTIME":9100},{"INPUT":[1],"ENDTIME":8883},{"INPUT":[0],"ENDTIME":8433},{"INPUT":[2],"ENDTIME":8400},{"INPUT":[0],"ENDTIME":7550},{"INPUT":[1],"ENDTIME":7133},{"INPUT":[0],"ENDTIME":6783},{"INPUT":[2],"ENDTIME":6733},{"INPUT":[0],"ENDTIME":6450},{"INPUT":[1],"ENDTIME":6033},{"INPUT":[0],"ENDTIME":5650},{"INPUT":[2],"ENDTIME":5633},{"INPUT":[0],"ENDTIME":883}];

    this.currentRecord = this.records.pop();

    this.setCollision();

    this.marker = new GhostGirderMarker();
    this.marker.setMaster(this);

    console.log('Ghost Gus (a.k.a girder ghost) created.')
  }

  evaluateRecord() {
    if (this.currentRecord) {
      this.currentRecord.INPUT.forEach(action => {
        switch (action) {
          case 1:
            this.walk('left');
            console.log('LEFT')
            console.log(this.getTime())
            break;
          case 2:
            this.walk('right');
            console.log('RIGHT');
            console.log(this.getTime())
            break;
          case 3:
            // debugger;
            this.marker.placeGirder();
            console.log(this.getTime())
            break;
          default:
            console.log('nothing')
            this.stop();
            break;
        }
      });

      if (this.isRecordExpired()) {
        console.log('current: ', this.currentRecord)
        this.currentRecord = this.records.pop();
        console.log('time: ', this.getTime())

        console.log('new: ', this.currentRecord)
      }
    }
  }

  getTime() {
    return game.time.now - this.startTime;
  }

  isRecordExpired() {
    const currentTime = this.getTime();
    const currentRecordEnd = this.currentRecord.ENDTIME;
    // console.log(currentTime, currentRecordEnd);

    return currentTime >= currentRecordEnd - this.timingTolerance;
  }

  // diff from Gus's doom: doesn't unlock the dolly
  doom() {

    this.sprite.body.clearCollision();
    this.sprite.body.fixedRotation = false;

    this.sprite.body.velocity.x = Math.sin(this.rotation) * 250;
    this.sprite.body.velocity.y = Math.cos(this.rotation) * -250;

    this.sprite.body.angularVelocity = 30;
    //this.sprite.body.rotateRight( 360 );

  }

  setCollision() {
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_PLAYER_SOLID);
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_PLAYER_SENSOR, this.rotationSensor);
    this.sprite.body.collides([COLLISION_GROUPS.GHOST_BLOCK_ROTATE, COLLISION_GROUPS.BLOCK_SOLID, COLLISION_GROUPS.BLOCK_ROTATE, COLLISION_GROUPS.ITEM, COLLISION_GROUPS.SPIKES]);
  }

  update() {
    if (Math.abs(Math.cos(this.rotation)) > EPSILON) this.sprite.body.velocity.x = 0;
    else this.sprite.body.velocity.y = 0;
    this.evaluateRecord();

    // check to see if we're rotating
    if (this.rotating) {
      console.log('hey')

      // stop all movement
      this.stop();
      this.sprite.body.velocity.y = 0;
      this.sprite.body.velocity.x = 0;

      // create a rotate tween
      if (this.rotateTween === undefined) {
        this.rotateTween = game.add.tween(this.sprite).to({
            rotation: this.targetRotation
          }, 300, Phaser.Easing.Default, true)
          .onComplete.add(function() {
            this.rotation = this.targetRotation % (TAU); // keep angle within 0-2pi
            this.finishRotation();
          }, this);
      }

    } else if (!this.isDead) {

      // do gravity
      this.applyGravity();

      if (this.rotationSensor.needsCollisionData) {
        this.setCollision();
        this.rotationSensor.needsCollisionData = false;
      }

      this.marker.update()

      if (!this.isTouching("down")) {
        this.fallTime += game.time.physicsElapsedMS;

        if (this.fallTime > this.killTime) {
          this.kill();
        }

      } else {
        this.fallTime = 0;
      }

    }

  }
}

module.exports = GhostGus;
