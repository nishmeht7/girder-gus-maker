'use strict';
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    map: {
        type: String,
        required: true
    },
    dateCreate: {
        type: Date,
        default: Date.now()
    },
    starCount: {
        type: Number,
        default: 0
    }
});
//difficulty was mentioned, but not part of MVP imo

mongoose.model('Level', schema);
