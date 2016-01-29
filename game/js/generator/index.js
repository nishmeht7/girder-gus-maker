var blockIds = require( "./blockIds" );
var defaultSkyColor = require( "../consts/colors" ).DEFAULT_SKY;

function LevelGenerator( levelData ) {

  if ( blockIds === undefined ) console.error( "blockIds are undefined (wtf!!)")

  this.blockIds = blockIds;
  this.levelData = levelData;

}

LevelGenerator.prototype.getSkyColor = function() {
  return this.levelData.skyColor || defaultSkyColor;
}

LevelGenerator.prototype.parseObjects = function() {

  var levelObjects = [];
  var objDefList = this.levelData.objects;
  var blocks = this.blockIds;

  objDefList.forEach( function( objDef ) {

    // find the object definition function for this id
    var createFunction = undefined;
    if ( objDef.tile !== undefined && blocks[ objDef.tile ] !== undefined ) {
      createFunction = blocks[ objDef.tile ].onLoad;
    }

    if ( typeof createFunction !== "function" ) {
      console.error( "Received an invalid object definition from mapdata:\n", JSON.stringify( objDef ) );
      return;
    }

    // create it!
    levelObjects.push( createFunction( objDef ) );

  });

  return levelObjects;

}

module.exports = LevelGenerator;