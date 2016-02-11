'use strict';

const _ = require('lodash');

const game = window.game;

const Gus = require('./gus');
const ParticleBurst = require( "../particles/burst" );

const COLLISION_GROUPS = require( "../consts/collisionGroups" );
const EPSILON = require( "../consts" ).EPSILON;
const TAU = require( "../consts" ).TAU;

const FRAMES_PER_COURSE_CORRECTION = 1;
const FREQUENCY_OF_COURSE_CORRECTION = 8; //this simply specifies how frequently a record gets decompressed, more is smoother, yustynn will adapt course correction to find the most recent correction and apply it

class RecordingGus extends Gus {
  constructor(x, y) {
    super(x, y);

    this.sprite.name = 'Recording Gus';

    this.spawnTime = game.time.now;

    this.inputRecords = [];

    this.courseCorrectionRecords = [];
    this.framesSinceCourseCorrectionRecord = 0;

    this.currentRecord = { input: [0] };

  }

  finalizeRecords() {
    if (!this.recordsFinalized) {
      this.inputRecords = this.inputRecords.reverse();
      this.courseCorrectionRecords = this.courseCorrectionRecords.reverse();


  		this.compressRecord();
  		console.log(this.compressed);
  		console.table(this.decompressRecord());

      this.recordsFinalized = true;
    }
  }

  recordCourseCorrection() {
		//when gus is rotating, he is not moving, if he is not moving, replayed gus can't be out of sync
		if(!this.rotating) {
			this.courseCorrectionRecords.push({
				x: this.sprite.x,
				y: this.sprite.y,
				f: this.isTouching('down'),
        r: this.rotation,
			  time: this.getTime()
			})
		}
	}

	compressRecord() {
		this.compressed = [];
		var ccr = this.courseCorrectionRecords.reverse();
		var lastFallingFrame = 0;
		for(var i = 0; i < ccr.length-1; i++) {
			if(ccr[i+1].x > ccr[i].x && ccr[i+1].y == ccr[i+1].y && ccr[i].f) {
				//moving right and not falling
				var j = i+1;
				while(j < ccr.length && ccr[j-1].x < ccr[j].x && ccr[i+1].y == ccr[i+1].y && ccr[j++].f) {};
				this.compressed.push({
					start: ccr[i],
					end: ccr[j-1]
				});
				i=j;
			}
			else if(ccr[i+1].x < ccr[i].x && ccr[i+1].y == ccr[i+1].y && ccr[i].f) {
				//moving left and not falling
				var j = i+1;
				while(j < ccr.length && ccr[j-1].x > ccr[j].x && ccr[i+1].y == ccr[i+1].y && ccr[j++].f) {};
				this.compressed.push({
					start: ccr[i],
					end: ccr[j-1]
				});
				i=j;
			}
			else if(ccr[i+1].y < ccr[i].y && ccr[i+1].x == ccr[i+1].x && ccr[i].f) {
				//moving down and not falling
				var j = i+1;
				while(j < ccr.length && ccr[j-1].y > ccr[j].y && ccr[i+1].x == ccr[i+1].x && ccr[j++].f) {};
				this.compressed.push({
					start: ccr[i],
					end: ccr[j-1]
				});
				i=j;
			}
			else if(ccr[i+1].y > ccr[i].y && ccr[i+1].x == ccr[i+1].x && ccr[i].f) {
				//moving up and not falling
				var j = i+1;
				while(j < ccr.length && ccr[j-1].y < ccr[j].y && ccr[i+1].x == ccr[i+1].x && ccr[j++].f) {};
				this.compressed.push({
					start: ccr[i],
					end: ccr[j-1]
				});
				i=j;
			}
			else if(ccr[i+1].y == ccr[i].y && ccr[i+1].x == ccr[i+1].x && ccr[i].f) {
				//stationary
				var j = i+1;
				while(j < ccr.length && ccr[j-1].y == ccr[j].y && ccr[i+1].x == ccr[i+1].x && ccr[j++].f) {};
				this.compressed.push({
					start: ccr[i],
					end: ccr[j-1]
				});
				i=j;
			}
			else {
				//gus is falling
				if(i - lastFallingFrame >= 10) {
					this.compressed.push({
						start: ccr[i],
						end: ccr[i]
					});
					lastFallingFrame = i;
				}
			}
		}
	}

	decompressRecord() {
		var comp = this.compressed;
		this.decomp = [];
		comp.forEach((pair) => {
			if(pair.start.time === pair.end.time) this.decomp.push(pair.start);
			else {
				var xRange = pair.end.x - pair.start.x;
				var yRange = pair.end.y - pair.start.y;
				var frames = Math.ceil((pair.end.time - pair.start.time) / FREQUENCY_OF_COURSE_CORRECTION);
				for(var i = 0; i <= frames; i++) {
					this.decomp.push({
						f: true,
						time: pair.start.time + i * FREQUENCY_OF_COURSE_CORRECTION,
						x: pair.start.x + (i / frames) * xRange,
						y: pair.start.y + (i / frames) * yRange
					});
				}
			}
		});
		return this.decomp;
	}

  getTime() {
    return game.time.now - this.spawnTime;
  }

  timeSinceSpawn() {
    return game.time.now - this.spawnTime;
  }

  recordInput(win) {
    if (this.recordsFinalized || this.isDead) return;

    const input = [];
    const spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    const r = game.input.keyboard.addKey(Phaser.Keyboard.R);

    // not sure what's supposed to happen if both are held down,
    // but I'm defaulting to the 'right' action
    if (game.cursors.left.isDown) input.push(1);
    if (game.cursors.right.isDown) input.push(2);
    if (spacebar.isDown) input.push(3);
    if (r.isDown || win) input.push(4);
    if (!input.length) input.push(0);
    if (!_.isEqual(this.currentRecord.input, input)){
      this.inputRecords.push({
        input: this.currentRecord.input,
        endTime: this.timeSinceSpawn()
      });
      this.currentRecord.input = input;
    }

  }

  resetSpawnTime() {
    this.spawnTime = game.time.now;
  }

  kill() {
    this.finalizeRecords();

    // for development
    const recordNode = document.getElementById('arr');
    if (recordNode) recordNode.textContent = JSON.stringify(this.inputRecords) + '\n\n' + JSON.stringify(this.courseCorrectionRecords);

    new ParticleBurst( this.sprite.position.x, this.sprite.position.y, "GusHead", {
      lifetime: 5000,
      count: 14,
      scaleMin: 0.4,
      scaleMax: 1.0,
      speed: 100,
      fadeOut: true
    });

    this.sprite.visible = false;
    this.isDead = true;

    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;

  }

  respawn() {
    super.respawn()

    this.resetSpawnTime();
    this.inputRecords = [];
    this.courseCorrectionRecords = [];
    this.framesSinceCourseCorrectionRecord = 0;
    this.recordsFinalized = false;
  }

  update() {
    this.recordInput();
    this.recordCourseCorrection();

    if (this.framesSinceCourseCorrectionRecord === FRAMES_PER_COURSE_CORRECTION) {
      // this.recordCourseCorrection();
      this.framesSinceCourseCorrectionRecord = 0;
    } else {
      this.framesSinceCourseCorrectionRecord++;
    }

    // clear horizontal movement
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

      // check for input
      if (game.cursors.left.isDown) {
        this.walk("left");
      } else if (game.cursors.right.isDown) {
        this.walk("right");
      } else {
        this.stop();
      }

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

module.exports = RecordingGus;
