'use strict';
const mongoose = require('mongoose');

var schema = new mongoose.schema({
	title: {type: String, required: true},
	creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	map: {required: true},
	dateCreate: {
            type: Date,
            default: Date.now()
	},
	starCount: {type: Number, default: 0}
});
//difficulty was mentioned, but not part of MVP imo

var Level = mongoose.model('Level', schema);
