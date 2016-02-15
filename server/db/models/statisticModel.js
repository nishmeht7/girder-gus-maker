const chalk = require( 'chalk' );
const mongoose = require( 'mongoose' );

const env = require('../../env');
const post = require( '../../helpers/promisifiedPost' );

const Level = mongoose.model( 'Level' );
const User = mongoose.model( 'User' );

const schema = new mongoose.Schema( {
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  girdersPlaced: {
    type: Number,
    required: true
  },
  // in milliseconds
  timeToComplete: {
    type: Number,
    required: true
  }
} );

// save in demography if demography knows about the level
schema.post( 'save', ( doc, next ) => {

  let url;

  const postData = {
    data: [{
      id: doc._id,
      girdersPlaced: doc.girdersPlaced,
      timeToComplete: doc.timeToComplete
    }],
    token: env.DEMOGRAPHY.ACCESS_KEY
  }

  // retrieve datasetId from level
  Level.findById( doc.level )
  .then( ( level ) => {
    if ( !level || !level.datasetId ) {
      console.log( chalk.gray( 'Level dataset not on Demography. Stats will not be saved in Demography.' ) );
      return next()
    }

    url = env.DEMOGRAPHY.API_URL + level.datasetId + '/entries';

    return User.findById( doc.player );
  } )
  .then( ( player ) => {
    postData.data[0].playerName = player.name;

    return post( url, postData );
  } )
  .then( ( res ) => {
    console.dir( res )
    if ( res.success ) console.log( chalk.green( 'Data successfully saved to Demography!' ) );
    else console.log( chalk.red( 'Data failed to save to Demography :(' ) );

    next();
  }, next )
} );

mongoose.model( 'Statistic', schema );
