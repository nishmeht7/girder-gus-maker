'use strict';

const game = window.game;

const Gus = require('./gus');
const GhostGirderMarker = require('./ghostGirderMarker');
const ParticleBurst = require("../particles/burst");

const COLLISION_GROUPS = require("../consts/collisionGroups");
const EPSILON = require("../consts").EPSILON;
const TAU = require("../consts").TAU;

const FREQUENCY_OF_COURSE_CORRECTION = 8;

class GhostGus extends Gus {
  constructor(x, y) {
    super(x, y, false);

    this.sprite.name = 'Ghost Gus';

    this.sprite.alpha = 0.5;

    this.spawnTime = game.time.now;
    this.timingTolerance = -20; // in ms

    this.setCollision();

    this.marker = new GhostGirderMarker();
    this.marker.setMaster(this);

    console.log('Ghost Gus (a.k.a girder ghost) created.')
  }

  decompressRecord() {
    const comp = this.courseCorrectionRecords;
    this.decomp = [];

	comp.forEach((pair, indx) => {
		if (pair.start.time === pair.end.time) {
			console.log('decompressing a falling record');
			if(comp[indx-1].end.time) {
				console.log('doing fancy math');
				//this record comes after a previous record, interpolate from previous record to here
				let xRange = pair.start.x - comp[indx-1].end.x;
				let yRange = pair.start.y - comp[indx-1].end.y;
				let frames = Math.ceil((pair.start.time - comp[indx-1].end.time) / FREQUENCY_OF_COURSE_CORRECTION);
				for (let i = 0; i <= frames; i++) {
					console.log('adding a frame: ', i);
					this.decomp.push({
						f: false,
						time: comp[indx-1].end.time + i * FREQUENCY_OF_COURSE_CORRECTION,
						x: comp[indx-1].end.x + (i / frames) * xRange,
						y: comp[indx-1].end.y + (i / frames) * yRange,
						r: pair.start.r
					});
				}
			} else {
				console.log('falling without a previous record');
				this.decomp.push(pair.start);
			}
		}
		else {
			let xRange = pair.end.x - pair.start.x;
			let yRange = pair.end.y - pair.start.y;
			let frames = Math.ceil((pair.end.time - pair.start.time) / FREQUENCY_OF_COURSE_CORRECTION);
			for (let i = 0; i <= frames; i++) {
				this.decomp.push({
					f: true,
					time: pair.start.time + i * FREQUENCY_OF_COURSE_CORRECTION,
					x: pair.start.x + (i / frames) * xRange,
					y: pair.start.y + (i / frames) * yRange,
					r: pair.start.r
				});
			}
		}
	});

	this.decomp = this.decomp.reverse();
	console.log(this.courseCorrectionRecords);
    console.table(this.decomp)
  }

  setCourseCorrectionRecords(courseCorrectionRecords) {
    this.courseCorrectionRecords = courseCorrectionRecords;
  }

  setInputRecords(inputRecords) {
    if (!this.inputRecordsSet) {

      this.inputRecords = inputRecords;
      if (this.inputRecords.length) {
        this.currentInputRecord = this.inputRecords.pop();
        this.currentInputRecord.hasBeenExecuted = false;

        // hacky fix for edge case where 'win'/doom() gets added into the first input record
        this.currentInputRecord.input = this.currentInputRecord.input.filter((n) => n !== 4)
      }

      this.inputRecordsSet = true;

    }
  }

  correctCourse() {

    if (this.isScrewed) return;
	if (this.rotating) return;

    const courseCorrection = this.getClosestCourseCorrection();

    if (!courseCorrection) return;

    if (this.isScrewed) return;

    this.sprite.body.x = courseCorrection.x;
    this.sprite.body.y = courseCorrection.y;
    this.rotation = courseCorrection.r;

    if (!courseCorrection) {
      var respawnBurst = new ParticleBurst(this.sprite.x, this.sprite.y, "GusHead", {
        lifetime: 3000,
        count: 14,
        scaleMin: 0.2,
        scaleMax: 1.0,
        rotMin: 0,
        rotMax: 360,
        speed: 100,
        fadeOut: true
      });
      this.destroy();
    }
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

  destroy() {
    console.log('GHOST GUS IS BANISHED')
    this.marker.girdersPlaced.forEach((girder) => {
      girder.sprite.destroy()
    });
    this.marker.sprite.destroy();

    this.sprite.destroy();

    this.isDestroyed = true;
  }

  finishRotation() {
    if (this.isDestroyed) return;
    super.finishRotation();
  }

  evaluateInputRecord() {
    if (this.isScrewed) return;

    if (this.currentInputRecord) {

      if (this.isRecordExpired() && this.currentInputRecord.hasBeenExecuted) {
        this.currentInputRecord = this.inputRecords.pop();
      }

      if (!this.currentInputRecord) return;

      this.currentInputRecord.input.forEach(action => {
        if (action === 1) {
          this.walk('left');
        } else if (action === 2) {
          this.walk('right');
        } else if (action === 3) {
          this.marker.placeGirder();
        } else if (action === 4) {

          this.isScrewed = true;

          this.doom();
        } else {
          this.stop()
        }
      });

      this.currentInputRecord.hasBeenExecuted = true;
    }
  }

  getTime() {
    return game.time.now - this.spawnTime;
  }

  getClosestCourseCorrection() {
    const ccr = this.decomp;
	if(ccr.length < 1) return null;

    let currentRecord = ccr[ccr.length - 1];

	try {
		while (currentRecord.time <= this.getTime()) {
			currentRecord = ccr.pop();
		}
	} catch (e) {
		console.log(ccr);
		console.log(e);
		console.log('\n\n\n\nThere was an error\n\n\n\n');
	}

	try {
		return (currentRecord.time - this.getTime() <= 10) ? currentRecord : null;
	} catch(e) {
		console.error(e);
		return null;
	}

  }

  isRecordExpired() {
    const currentTime = this.getTime();
    const currentInputRecordEnd = this.currentInputRecord.endTime;

    return currentTime >= currentInputRecordEnd - this.timingTolerance;
  }

  resetSpawnTime() {
    this.spawnTime = game.time.now;
  }

  setCollision() {
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_PLAYER_SOLID);
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_PLAYER_SENSOR, this.rotationSensor);
    this.sprite.body.collides([COLLISION_GROUPS.GHOST_BLOCK_ROTATE, COLLISION_GROUPS.BLOCK_SOLID, COLLISION_GROUPS.BLOCK_ROTATE, COLLISION_GROUPS.SPIKES]);
  }

  update() {
    if (this.isDestroyed) return;

    this.correctCourse();


    this.evaluateInputRecord();

    if (this.isDestroyed) return;



    if (Math.abs(Math.cos(this.rotation)) > EPSILON) this.sprite.body.velocity.x = 0;
    else this.sprite.body.velocity.y = 0;


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
  }
}

module.exports = GhostGus;
