'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');

// Calculate number of tiles for data validation
var TILE_MAP = require( "../../../game/js/consts/tilemap" );
const numTiles = Object.keys(TILE_MAP).length;

// part of level schema
const map = {
  startGirders: {
    type: Number,
    default: 0
  },
  checksum: {
    type: String,
    default: function() {
      if (!this.objects) return '';
      return this.objects.reduce((prev, next) => prev + next, '');
    }
  },
  objects: [{
    t: {
      type: Number,
      max: numTiles
    },
    x: {
      type: Number
    },
    y: {
      type: Number
    },
    r: {
      type: Number
    }
  }],
  skyColor: {
    type: String,
    default: "#4428BC"
  }
}

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  map: map,
  dateCreate: {
    type: Date,
    default: Date.now()
  },
  published: {
	 type: Boolean,
	 default: true
 },
  starCount: {
    type: Number,
    default: 0
  }
});
//difficulty was mentioned, but not part of MVP imo

// note whether level is new before saving
schema.pre('save', function(next) {
  this.wasNew = this.isNew;
  next();
})

// add level to creator's createdLevels if level is new
schema.post('save', function(doc, next) {
  if (doc.wasNew) {
    User.findById(doc.creator)
      .then(function(user) {
        return user.addLevel(doc._id);
      })
      .then(function(user) {
        next();
      })
  } else {
    next();
  }
})

// post-save hook to set total star count of associated user
schema.post('save', function(doc, next) {
  User.findById(doc.creator)
    .populate('createdLevels', 'starCount')
    .then(function(user) {
      return user.setStars();
    })
    .then(function(user) {
      next();
    }).then(null, function(error) {
      console.error(error);
      next();
    });
})

// hook to remove deleted level from creator's level list and
//   set users's new total star count
schema.post('remove', function(doc) {
  User.findById(doc.creator)
    .then(function(user) {
      // remove level from creator's list
      return user.removeLevel(doc._id);
    })
    // set user's total star count
    .then(function(user) {
      return user.setStars();
    })
})

mongoose.model('Level', schema);
