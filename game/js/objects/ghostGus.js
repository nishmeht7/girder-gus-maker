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
    this.timingTolerance = -20; // in ms


    this.inputRecords = [{"INPUT":[1],"ENDTIME":6403},{"INPUT":[1,2],"ENDTIME":4969},{"INPUT":[2],"ENDTIME":4952},{"INPUT":[0],"ENDTIME":4235},{"INPUT":[1],"ENDTIME":4219},{"INPUT":[0],"ENDTIME":3552},{"INPUT":[2],"ENDTIME":3518},{"INPUT":[0],"ENDTIME":2101}]


    this.currentInputRecord = this.inputRecords.pop();
    this.currentInputRecord.hasBeenExecuted = false;

    this.courseCorrectionRecords = [{"X":138.70716094970703,"Y":4153.9080810546875,"TIME":7579},{"X":138.70716094970703,"Y":3716.6781616210938,"TIME":7395},{"X":138.70716094970703,"Y":3303.4732055664062,"TIME":7212},{"X":138.70716094970703,"Y":2914.7601318359375,"TIME":7028},{"X":138.70716094970703,"Y":2551.017608642578,"TIME":6845},{"X":138.70716094970703,"Y":2212.7325439453125,"TIME":6661},{"X":138.70716094970703,"Y":1900.401611328125,"TIME":6470},{"X":167.82264709472656,"Y":1614.5309448242188,"TIME":6286},{"X":213.57555389404297,"Y":1355.6362915039062,"TIME":6103},{"X":259.3284606933594,"Y":1124.2442321777344,"TIME":5919},{"X":305.0813674926758,"Y":920.8908081054688,"TIME":5736},{"X":350.8342742919922,"Y":746.1228942871094,"TIME":5552},{"X":396.5871810913086,"Y":600.4980850219727,"TIME":5369},{"X":442.340087890625,"Y":484.58465576171875,"TIME":5186},{"X":488.0929946899414,"Y":398.9622116088867,"TIME":5002},{"X":467.2962188720703,"Y":344.22142028808594,"TIME":4819},{"X":421.5433120727539,"Y":320.96473693847656,"TIME":4635},{"X":375.9571075439453,"Y":320.1666259765625,"TIME":4452},{"X":330.52093505859375,"Y":320.1666259765625,"TIME":4269},{"X":355.31036376953125,"Y":320.1666259765625,"TIME":4085},{"X":400.7465362548828,"Y":320.1666259765625,"TIME":3902},{"X":446.21604919433594,"Y":320.1666259765625,"TIME":3702},{"X":475.1314926147461,"Y":320.1666259765625,"TIME":3502},{"X":429.69532012939453,"Y":320.1666259765625,"TIME":3318},{"X":384.2258071899414,"Y":320.1666259765625,"TIME":3135},{"X":338.77296447753906,"Y":320.1666259765625,"TIME":2951},{"X":297.2502136230469,"Y":320.1666259765625,"TIME":2768},{"X":251.89729690551758,"Y":320.1666259765625,"TIME":2585},{"X":206.54438018798828,"Y":320.16807556152344,"TIME":2401},{"X":161.07486724853516,"Y":320.20435333251953,"TIME":2218},{"X":128.00000190734863,"Y":320.16666412353516,"TIME":2051},{"X":128.00000190734863,"Y":320.16666412353516,"TIME":1851},{"X":128.00000190734863,"Y":320.16666412353516,"TIME":1667},{"X":128.00000190734863,"Y":320.16666412353516,"TIME":1484},{"X":128.00000190734863,"Y":320.16666412353516,"TIME":1301},{"X":128.00000190734863,"Y":320.16666412353516,"TIME":1117},{"X":128.00000190734863,"Y":320.16666412353516,"TIME":934},{"X":128.00000190734863,"Y":320.16666412353516,"TIME":767},{"X":128.00000190734863,"Y":320.16693115234375,"TIME":567},{"X":128.00000190734863,"Y":320.17547607421875,"TIME":367}];

    this.currentCourseCorrectionRecord = this.courseCorrectionRecords.pop();

    this.setCollision();

    this.marker = new GhostGirderMarker();
    this.marker.setMaster(this);

    console.log('Ghost Gus (a.k.a girder ghost) created.')
  }

  correctCourse() {
    this.sprite.body.x = this.currentCourseCorrectionRecord.X;
    this.sprite.body.y = this.currentCourseCorrectionRecord.Y;

    if (this.courseCorrectionRecords.length)
      this.currentCourseCorrectionRecord = this.courseCorrectionRecords.pop();
  }

  evaluateInputRecord() {

    if (this.currentInputRecord) {

      if (this.isRecordExpired() && this.currentInputRecord.hasBeenExecuted) {
        this.currentInputRecord = this.inputRecords.pop();
      }

      if (!this.currentInputRecord) return;

      this.currentInputRecord.INPUT.forEach(action => {
        switch (action) {
          case 1:
            this.walk('left');
            break;
          case 2:
            this.walk('right');
            break;
          case 3:
            this.marker.placeGirder();
            break;
          default:
            this.stop();
            break;
        }
      });

      this.currentInputRecord.hasBeenExecuted = true;
    }
  }

  getTime() {
    return game.time.now - this.startTime;
  }

  isRecordExpired() {
    const currentTime = this.getTime();
    const currentInputRecordEnd = this.currentInputRecord.ENDTIME;

    return currentTime >= currentInputRecordEnd - this.timingTolerance;
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
    this.sprite.body.collides([COLLISION_GROUPS.GHOST_BLOCK_ROTATE, COLLISION_GROUPS.BLOCK_SOLID, COLLISION_GROUPS.BLOCK_ROTATE, COLLISION_GROUPS.SPIKES]);
  }

  update() {
    if (Math.abs(Math.cos(this.rotation)) > EPSILON) this.sprite.body.velocity.x = 0;
    else this.sprite.body.velocity.y = 0;
    this.evaluateInputRecord();


    // check to see if we're rotating
    if (this.rotating) {
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


    // course correction
    if (this.getTime() >= this.currentCourseCorrectionRecord.TIME) {
      this.correctCourse();
    }

  }
}

module.exports = GhostGus;
