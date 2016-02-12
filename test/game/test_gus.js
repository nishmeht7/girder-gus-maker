// instantiate test suite
var chai = require('chai');
var spies = require('chai-spies');
chai.use( spies );
var expect = chai.expect;

game = {
  freeLookKey: { isDown: function() { return false } },
  add: { sprite: function() { return { 
    rotation: 0, 
    position: { x: 0, y: 0 },
    scale: { x: 0, y: 0 },
    body: {
      velocity: { x: 0, y: 0 },
      setCollisionGroup: function() {},
      setRectangle: function() {},
      addRectangle: function() { return {} },
      collides: function() {},
      onBeginContact: { add: function() {} },
      clearCollision: function() {}
    },
    reset: function() {},
    animations: {
      add: function() {},
      play: function() {}
    }
  }}},
  time: {
    elapsed: function() { return 1 },
    physicsElapsed: function() { return 1 }
  },
  physics: {
    p2: {
      enable: function() {},
      world: { narrowphase: { contactEquations: [] }}
    }
  }
}

window = { game: game };

p2 = {
  vec2: {
    fromValues: function( x, y ) { return [x,y] }
  }
}

// instantiate gus
var Gus = require('../../game/js/objects/gus');
var GusMath = require('../../game/js/objects/gus/math');
var helpers = require('../../game/js/objects/gus/helpers');

describe('Helper function', function() {

  describe('compose', function() {

    var fns = [
      function( a, b ) { return a + b },
      function( a ) { return a * 2 },
      function( a ) { return [ a, a/2 ] },
      function( a ) { console.log( a ) }
    ]

    it('can compose functions together, chaining values through them', function() {

      var compedFn = helpers.compose( fns[1], fns[3] );
      expect( compedFn( 3 ) ).to.be.undefined;

      compedFn = helpers.compose( fns[2], fns[0], fns[1] );
      expect( compedFn( 10 ) ).to.equal( 30 );

    });
  });
});

describe('GusMath', function() {

  describe('trig functions', function() {

    var EPSILON = 0.00001;
    var gMath;
    beforeEach('create a new GusMath instance', function() {
      gMath = new GusMath({ rotation: 0 });
    });

    it('properly calculates sine/cosine', function() {

      expect( gMath.cos() ).to.be.closeTo( 1, EPSILON, "cosine of 0 is incorrect" );
      expect( gMath.sin() ).to.be.closeTo( 0, EPSILON, "sine of 0 is incorrect" );

      gMath.gus.rotation = Math.PI;
      expect( gMath.cos() ).to.be.closeTo( -1, EPSILON, "cosine of pi is incorrect" );
      expect( gMath.sin() ).to.be.closeTo( 0, EPSILON, "sine of pi is incorrect" );

      gMath.gus.rotation = (Math.PI/2)*3;
      expect( gMath.cos() ).to.be.closeTo( 0, EPSILON, "cosine of 3pi/2 is incorrect" );
      expect( gMath.sin() ).to.be.closeTo( -1, EPSILON, "sine of 3pi/2 is incorrect" );

    });

    it('caches sine/cosine until gus\'s rotation changes', function() {

      chai.spy.on( gMath, 'updateCache' );

      gMath.cos();
      expect( gMath.updateCache ).to.have.not.been.called();

      gMath.gus.rotation = Math.PI;
      gMath.sin();
      gMath.cos();
      expect( gMath.updateCache ).to.have.been.called.once;

    });

    it('stress tests', function() {

      chai.spy.on( gMath, 'updateCache' );

      var calls = 0;
      for ( var i = 0; i < 100; ++i ) {
        if ( Math.random() > 0.8 ) {
          var curRot = gMath.gus.rotation;
          gMath.gus.rotation = Math.random() * Math.PI * 2;
          if ( gMath.gus.rotation !== curRot ) {
            ++calls;
          };
        }

        expect( gMath.cos() ).to.be.equal( Math.cos( gMath.gus.rotation ), "cosine of " + gMath.gus.rotation + " is incorrect" );
        expect( gMath.sin() ).to.be.equal( Math.sin( gMath.gus.rotation ), "sine of " + gMath.gus.rotation + " is incorrect" );
        expect( gMath.updateCache ).to.have.been.called.exactly( calls );
      }

    });

  });
});

describe("Gus himself", function() {

  var gus;
  beforeEach('is being instantiated', function() {
    gus = new Gus(0, 0);
  });

  xit('falls the right way when gravity is applied', function() {

    console.dir( gus.sprite );
    gus.applyGravity();
    expect( gus.sprite.body.velocity.y ).to.be.at.least( 1, "gus doesn't fall" );

  });

  xit('sets its velocity when it walks left and right', function() {

    gus.walk("right");
    expect( gus.sprite.body.velocity.x ).to.be.at.least( 1, "walking horizontally didn't increase gus's velocity" );

    gus.rotation = Math.PI/2;
    gus.walk("left");
    expect( gus.sprite.body.velocity.y ).to.be.at.least( 1, "walking vertically didn't increase gus's velocity" );

  });

});

