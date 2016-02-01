'use strict';
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likedLevels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level'
    }],
    createdLevels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level'
    }],
    totalStars: {
        type: Number,
        default: 0
    },
    profilePic: {
        type: String
    }
});

// sets user's totalStars based on sum of stars for user's createdLevels
schema.methods.setStars = function() {
	var that = this;
	var Level = mongoose.model('Level');
	return Level.find({_id: {$in: that.createdLevels}}).then(function(usersLevels) {
		that.totalStars = usersLevels.reduce(function(prev, level) {
			return prev + level.starCount;
		}, 0);
		return that.save();
	});
};

// adds levelId to user's createdLevels array
schema.methods.addLevel = function(levelId) {
    if(this.createdLevels.indexOf(levelId) === -1){
        this.createdLevels.push(levelId);
        return this.save();
    }
};

// removes levelId from user's createdLevels array
schema.methods.removeLevel = function(levelId) {
    this.createdLevels = this.createdLevels.filter(function(level) {
        return level !== levelId;
    })

    return this.save();
};

schema.virtual('totalFollowers').get(function() {
    return this.followers.length;
});

schema.virtual('totalFollowed').get(function() {
    return this.following.length;
});

schema.virtual('totalCreatedLevels').get(function() {
    return this.createdLevels.length;
});

schema.virtual('totalLikedLevels').get(function() {
    return this.likedLevels.length;
});

var User = mongoose.model('User', schema);
