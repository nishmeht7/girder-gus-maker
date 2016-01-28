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
    }]
});

mongoose.model('User', schema);
